#!/usr/bin/env python3

import os.path
import sqlite3
import re
import json
import click

def data_handler(data):    
    return_data = json.dumps(data, sort_keys=True, indent=4,
                            separators=(',', ': '))
    print(return_data)

@click.command()
@click.option(
    '--path',
    default='~/Library/Application Support/Google/Chrome/Default/Web Data',
    help="Path to Chrome's 'Web Data' Folder")
@click.option(
    '--outfile',
    default='se_from_chrome.json',
    help="Output file")


def export(path, outfile):
    path = os.path.expanduser(path)    
    conn = sqlite3.connect(path)
    with conn:
        try:
            keywords = conn.execute('''select * from keywords''')
        except sqlite3.OperationalError:            
            data_handler([{"success":False,"error":{"code":"010","message":"Is Chrome running? Must be closed to work."}}])
            raise

    search_engines = [{'name': kw[1], 'keyword': kw[2], 'url': kw[4]}
                      for kw in keywords if re.search(r'{searchTerms}', kw[4])]

    output = json.dumps(search_engines, sort_keys=True, indent=4,
                        separators=(',', ': '))    
    with open(outfile, 'w') as w:
        w.write(json.dumps([{'success':True,'payload':output,'error':'null'}], sort_keys=True, indent=4,
                            separators=(',', ': ')))
    data_handler([{'success':True,'payload':output,'error':'null'}])

if __name__ == "__main__":
    export()            