const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const mysql = require('mysql2');
require('console.table');

const db = mysql.createConnection({
    user: "root",
    database: "employee_db",
});

// Shows all the data within the table selected
const selectAll = async (table, display) => {
    const results = await db.promise().query('SELECT * FROM ' + table);
    if (display) {
        console.table(results[0]);
        return init();
    }
    return results;
};

// Inserts data into table
const insert = (table, data) => {
    db.query('INSERT INTO ?? SET ?', [table, data], (err) => {
        if (!err) 
        {console.log('\nSuccesfully created!\n');
    } console.log(err);
        init();
    });
};

// Updates employee table data
const updateEmployee = (table, role, id) => {
    return db.query('UPDATE ?? SET role_id=? WHERE id=?', [table, role, id], (err) => {
        if (!err) 
        {console.log('\nSuccesfully created!\n');
    } console.log(err);
        init();
    });
};

// Selects specefic data from selected table
const selectAllNameAndValue = (table, name, value) => {
    console.log(table , name, value);
    return db.promise().query('SELECT ?? AS name, ?? AS value FROM ??', [name, value, table]);
};

// Joins data to create manager info
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
    init();
};

// Add employee prompt questions
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

// Add department prompt questions
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

// Add role prompt questions
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

// Update role prompt questions
const updateRole = async () => {
    const [employees] = await selectAllNameAndValue('employee', 'last_name', 'id');
    const [roles] = await selectAllNameAndValue('role', 'title', 'id');
    prompt([
        {
            type: 'rawlist',
            name: 'id',
            message: "Select Employee to update Role",
            choices: employees
        },
        {
            type: 'rawlist',
            name: 'role_id',
            message: "Select New Role for employee",
            choices: roles
        }
    ])
        .then((answers) => {
            updateEmployee('employee', answers.role_id, answers.id)
        })
}

// Switch/case to select option in app
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
        case 'UPDATE EMPLOYEE ROLE': {
            updateRole();
            break;
        }
    }
};

// Initializer function
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
            'UPDATE EMPLOYEE ROLE',
        ],
        name: 'type',
    })
        .then((answers) => {
            chooseOption(answers.type);
        });
};

init();