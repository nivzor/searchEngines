const inquirer = require('inquirer');

inquirer
    .prompt([
        {
            type: 'list',
            name: 'tagName',
            message: 'Select component type:',
            choices: ["nin","kek"],
            paginated: true
        }
    ])
    .then(answer => {
        console.log(answer);
    });