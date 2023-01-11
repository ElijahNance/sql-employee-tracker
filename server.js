const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const mysql = require('mysql2');
require('console.table');

const db = mysql.createConnection({
    user: "root",
    database: "employee_db",
});

const selectAll = async (table, display) => {
    const results = await db.promise().query('SELECT * FROM ' + table);
    if (display) {
        console.table(results[0]);
        return init();
    }
    return results;
};

const insert = (table, data) => {
    db.query('INSERT INTO ?? SET ?', [table, data], (err) => {
        if (!err) 
        {console.log('\nSuccesfully created!\n');
    } console.log(err);
        init();
    });
};

const selectAllNameAndValue = (table, name, value) => {
    return db.promise().query('SELECT ?? AS name, ?? AS value FROM ??', [name, value, table]);
};

const selectAllEmployeeDetails = async () => {
    const statement = `
        SELECT 
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            role.salary,
            CONCAT(
                manager.first_name,
                ' ',
                manager.last_name    
            ) AS MANAGER
        FROM EMPLOYEE
        JOIN role
        ON employee.role_id = role.id
        JOIN employee AS manager
        ON employee.manager_id = manager.id
        `
    const [employees] = await db.promise().query(statement);
    console.table(employees);
};

const addEmployee = async () => {
    const [roles] = await selectAllNameAndValue('role', 'title', 'id');
    const [managers] = await selectAllNameAndValue('employee', 'last_name', 'id');
    prompt([
        {
            name: 'first_name',
            message: "Enter the employee's first name."
        },
        {
            name: 'last_name',
            message: "Enter the employee's last name."
        },
        {
            type: 'rawlist',
            name: 'role_id',
            message: "Choose a role for this employee.",
            choices: roles,
        },
        {
            type: 'rawlist',
            name: 'manager_id',
            message: "Choose a manager for this employee.",
            choices: managers,
        }
    ])
        .then((answers) => {
            insert('employee', answers);
        });
};

const addDepartment = () => {
    prompt([
        {
            name: 'name',
            message: "Enter New Department Name"
        }
    ])
        .then((answers) => {
            insert('department', answers)
        });
};

const addRole = async () => {
    const [departments] = await selectAllNameAndValue('department', 'name', 'id'); 
    prompt([
        {
            name: 'title',
            message: "Enter New Role Name"
        },
        {
            name: 'salary',
            message: "Enter New Role Salary"
        },
        {
            type: 'rawlist',
            name: 'department_id',
            message: "Select Department For The Role",
            choices: departments
        }
    ])
        .then((answers) => {
            insert('role', answers)
        });
};

const chooseOption = (type) => {
    switch (type) {
        case 'VIEW ALL EMPLOYEES': {
            selectAllEmployeeDetails();
            break;
        }

        case 'VIEW ALL DEPARTMENTS': {
            selectAll('department', true);
            break;
        }
        case 'VIEW ALL ROLES': {
            selectAll('role', true);
            break;
        }
        case 'ADD EMPLOYEE': {
            addEmployee();
            break;
        }
        case 'ADD DEPARTMENT': {
            addDepartment();
            break;
        }
        case 'ADD ROLE': {
            addRole();
            break;
        }
    }
};

const init = () => {
    prompt({
        type: 'rawlist',
        message: "Choose one of the following",
        choices: [
            'VIEW ALL EMPLOYEES',
            'VIEW ALL DEPARTMENTS',
            'VIEW ALL ROLES',
            'ADD EMPLOYEE',
            'ADD DEPARTMENT',
            'ADD ROLE',
        ],
        name: 'type',
    })
        .then((answers) => {
            chooseOption(answers.type);
        });
};

init();