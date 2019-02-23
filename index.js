const inquirer = require('inquirer');
const fs = require('fs');
const shell = require("shelljs");
const querystring = require("querystring");
const fuzzy = require('fuzzy');

let runPy = new Promise(function(resolve, reject) {
    const { spawn } = require('child_process');
    const pyprog = spawn('python3', ['searchMe.py']);

    pyprog.stdout.on('data', function(data) {
        resolve(data);
    });
    pyprog.stderr.on('data', (data) => {
        reject(data);
    });
});

let botData;

let dataHandler = (data) => {
    botData = getSearchRobot(data);
    searchSomewhere();
}

let getSearchRobot = (json) => {
    botData = {};
    let options = [];
    json.map(x => {
        options.push(x['name']);
        botData[x['name']] = { "se": x['url'] };
    });
    botData['options'] = options;
    return botData;
}

function searchEngines(answers, input) {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, botData.options);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, Math.random(30, 500));
  });
}

let lunchChrome = (obj) => {    
    const { spawn } = require('child_process');    
    const uri = botData[obj.search_engine]['se'].replace('{searchTerms}', querystring.escape(obj.searchTerms));
    shell.exec("open -a 'Google Chrome' " + uri, { shell: '/bin/bash' });
    console.log(uri);
}
let fetchDataFromChrome = () => {
    runPy.then((fromRunpy) => {
            data = JSON.parse(fromRunpy);
            if (data[0].success) {
                dataHandler(JSON.parse(data[0].payload));
            } else {
                console.log('Something went wrong.\n' + data[0].error.message);
            };
        })
        .catch(() => {
            console.log('ayyy');
        });
}
let initSearchRunner = () => {
    if (fs.existsSync('se_from_chrome.json')) {
        fs.readFile('se_from_chrome.json', (err,content) =>{
            data = JSON.parse(content);
            if (data[0].success) {
               dataHandler(JSON.parse(data[0].payload));
            }
            else {
                console.log('Something went wrong.\n' + data[0].error.message);
            };
        });
    } else{
        fetchDataFromChrome();
    }
}

let searchSomewhere = () => {
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    inquirer
        .prompt([{
                type: 'autocomplete',
                name: 'search_engine',
                message: 'Select Search Engine',
                source: searchEngines,
                paginated: true
            },
            {
                type: 'input',
                name: 'searchTerms',
                message: "What would you like to search?",
                validate: requireNameLength

            }
        ])
        .then(answer => {
            lunchChrome(answer);
        });
}

const requireNameLength = value => {
    if (value.trim().length > 0 ) {        
        return true;
    }

    return 'Value cannot be empty';
};
initSearchRunner();