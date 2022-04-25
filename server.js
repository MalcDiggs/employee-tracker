const express = require('express');
const inquirer = require("inquirer");
const mysql = require('mysql2/promise');
const db = require('./db/connection');
const cTable = require('console.table');

const PORT = process.env.PORT || 3000;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  app.listen(PORT, () => {});
});

// Start the prompt functions
function startPrompt() {
    inquirer.prompt({
            type: 'list',
            name: 'menu',
            message: 'What changes would you like to make?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Update An Employee Manager', 'Delete Department', 'Delete Role', 'Delete Employee'], 

    }).then( answer => {
        switch (answer.menu) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add A Department':
                addDepartment();
                break;
            case 'Add A Role':
                addRole();
                break;
            case 'Add An Employee':
                addEmployee();
                break;
            case 'Update An Employee Role':
                updateEmployeeRole();
                break;
            case 'Update An Employee Manager':
                updateEmployeeManager();
                break;
            case 'Delete Department':
                deleteDepartment();
                break;
            case 'Delete Role':
                deleteRole();
                break;
            case 'Delete Employee':
                deleteEmployee();
                break;
        }
    })
 };

// View all departments
function viewAllDepartments() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return;
        }
        console.table(result);
        startPrompt();
    });
};

// View all roles
function viewAllRoles() {
    const sql = `SELECT * FROM role`;
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return;
        }
        console.table(result);
        startPrompt();
    });
};

// View all employees
function viewAllEmployees() {
    const sql = `SELECT employee.id,
                employee.first_name,
                employee.last_name,
                role.title AS job_title,
                department.department_name,
                role.salary,
                CONCAT(manager.first_name, ' ' ,manager.last_name) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee AS manager ON employee.manager_id = manager.id
                ORDER By employee.id`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.table(result);
        startPrompt();
    });
};

// Add departments
function addDepartment() {
    inquirer.prompt([
        {
            name: "department_name",
            type: "input",
            message: "Please enter the department name to be added."
        }
    ]).then((answer) => {

    const sql = `INSERT INTO department (department_name)
                VALUES (?)`;
    const params = [answer.department_name];
    db.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log('The new department entered has been added successfully to the database.');

        db.query(`SELECT * FROM department`, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message })
                return;
            }
            console.table(result);
            startPrompt();
        });
    });
});
};

// Add a role
function addRole() {
    inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "Please enter the role you want to add."
        },
        {
            name: "salary",
            type: "input",
            message: "Please enter the salary for the role. (no dots/spaces/commas)"
        },
        {
            name: "department_id",
            type: "number",
            message: "Please enter the department's id for the role."
        }
    ]).then(function (response) {
        db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [response.title, response.salary, response.department_id], function (err, data) {
            if (err) throw err;
            console.log('The new role entered has been added successfully to the database.');

            db.query(`SELECT * FROM role`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Add employees
function addEmployee() {
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Enter the first name of the employee."
        },
        {
            name: "last_name",
            type: "input",
            message: "Enter the last name of the employee."
        },
        {
            name: "role_id",
            type: "number",
            message: "Enter the role id for the employee. (NUMBERS ONLY)."
        },
        {
            name: "manager_id",
            type: "number",
            message: "Enter the manager's id for the employee. (NUMBERS ONLY)."
        }

    ]).then(function (response) {
        db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [response.first_name, response.last_name, response.role_id, response.manager_id], function (err, data) {
            if (err) throw err;
            console.log('The new employee entered has been added successfully to the database.');

            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Update employee role
function updateEmployeeRole() {
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Enter the first name of the employee."
        },
        {
            name: "role_id",
            type: "number",
            message: "Enter the role number id for the employee to be updated.(NUMEBERS ONLY)."
        }
    ]).then(function (response) {
        db.query("UPDATE employee SET role_id = ? WHERE first_name = ?", [response.role_id, response.first_name], function (err, data) {
            if (err) throw err;
            console.log('The new role entered has been added successfully to the database.');

            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Update employee manager
function updateEmployeeManager() {
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Enter the first name of the employee to be updated."
        },
        {
            name: "manager_id",
            type: "number",
            message: "Enter the manager's id number for the updated employee. (NUMBERS ONLY)."
        }
    ]).then(function (response) {
        db.query("UPDATE employee SET manager_id = ? WHERE first_name = ?", [response.manager_id, response.first_name], function (err, data) {
            if (err) throw err;
            console.log("The new manager's id entered has been added successfully to the database.");

            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Delete department
function deleteDepartment() {
    inquirer.prompt([
        {
            name: "department_id",
            type: "number",
            message: "Enter the id of the department to be deleted. (NUMBERS ONLY)."
        }
    ]).then(function (response) {
        db.query("DELETE FROM department WHERE id = ?", [response.department_id], function (err, data) {
            if (err) throw err;
            console.log("The department entered has been deleted successfully from the database.");

            db.query(`SELECT * FROM department`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Delete role
function deleteRole() {
    inquirer.prompt([
        {
            name: "role_id",
            type: "number",
            message: "Enter the id of the role to be deleted. (NUMBERS ONLY)."
        }
    ]).then(function (response) {
        db.query("DELETE FROM role WHERE id = ?", [response.role_id], function (err, data) {
            if (err) throw err;
            console.log("The role entered has been deleted successfully from the database.");

            db.query(`SELECT * FROM role`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// Delete Employee
function deleteEmployee() {
    inquirer.prompt([
        {
            name: "employee_id",
            type: "number",
            message: "Enter the id of the employee to be deleted. (NUMBERS ONLY)."
        }
    ]).then(function (response) {
        db.query("DELETE FROM employee WHERE id = ?", [response.employee_id], function (err, data) {
            if (err) throw err;
            console.log("The employee entered has been deleted successfully from the database.");

            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message })
                    startPrompt();
                }
                console.table(result);
                startPrompt();
            });
        })
});
};

// // View employee by manager
// function viewAllEmpByManager() {
//     const sql = `  SELECT 
//             CONCAT(manager.first_name, ' ' ,manager.last_name) AS manager,
//             employee.id, 
//             employee.first_name, 
//             employee.last_name,  
//             roles.title AS Title,
//             department.department_name, 
//             roles.salary
//             FROM employee 
//             JOIN roles ON employee.role_id = roles.id
//             JOIN department ON roles.department_id = department.id
//             LEFT JOIN  employee AS manager ON employee.manager_id = manager.id
//             ORDER BY manager`;
//       db.query(sql, (err, result) => {
//           if(err) {
//               res.status(400).json({ error: err.message });
//               return;
//           }
//           console.table(result);
//           startPrompt();
//       });
// }

// Call to start app
startPrompt();