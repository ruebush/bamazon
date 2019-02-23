require('dotenv').config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var figlet = require('figlet');
var boxen = require('boxen');
var Table = require('cli-table3');

var connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "bamazon"
});
// welcome screen, with npm add ons 

figlet('Bamazon', function (err, data) {
  if (err) { console.dir(err); return };
  console.log("\r\n\r\n "
    + boxen(chalk.bold.white(data), { backgroundColor: "blue", borderColor: "white", padding: 1, margin: 1, borderStyle: 'round' }))
  console.log(chalk.bold.green("\n                  - Supervisor -\n\r\n\r\n\r\n\r"))

  // 
  connection.connect(function (err) {
    if (err) { throw err };
    
    supervisor();
  });
});

function supervisor() {
  inquirer.prompt({
    name: "customer",
    type: "list",
    message: "Please select from the list below:",
    choices: ["[View Product Sales by Department]", "[Create New Department]", "[Exit]"]
  })
    .then(function (answer) {
      switch (answer.customer) {
        case "[View Product Sales by Department]":
          viewDept();
          break;
        case "[Create New Department]":
          addDept();
          break;
        case "[Exit]":
          connection.end();
          process.exit();
          break;
      }
    });
}


function viewDept() {
  
  connection.query("SELECT department_name, SUM (product_sales) as product_sales FROM products GROUP BY department_name",
    function (err, prod) {
      if (err) { throw err };
  
      // updating product sales information in the database

      for (let j = 0; j < prod.length; j++) {
        connection.query("UPDATE departments SET ? WHERE ?",
          [{ product_sales: prod[j].product_sales }, { department_name: prod[j].department_name }],
          function (err, saleUpdate) {
            if (err) { throw err; };
          }
        )
      };
      viewDeptUp();
    }
  )
}

// reading data to show the user updated total profit/sales information 

function viewDeptUp() {

  let table = new Table({
    head: ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
  });

  // generate 

  connection.query("SELECT department_id, department_name, over_head_costs, product_sales, SUM (product_sales - over_head_costs) as total_profit FROM departments GROUP BY department_name",
    function (err, dept) {
      if (err) { throw err; };
   

      // pushing data to table

      for (let i = 0; i < dept.length; i++) {
        let deptArr = [chalk.yellow(dept[i].department_id), dept[i].department_name, chalk.cyanBright(dept[i].over_head_costs), chalk.magentaBright(dept[i].product_sales), chalk.redBright(dept[i].total_profit)];
        table.push(deptArr);
       
      }
      console.log(chalk.white("\n\n\n\n                                  departments table\n") + table.toString() + "\n\n\n\n");
      return supervisor();
    }
  )
}

// - adding the new user data to the database -

function addDept() {
  inquirer.prompt([{
    name: "deptID",
    type: "input",
    message: "Please enter the New Department ID",
  }, {
    name: "deptName",
    type: "input",
    message: "Please enter the New Department Name",
  }, {
    name: "deptCosts",
    type: "input",
    message: "Please enter the Over Head Costs",
  }])
    .then(function (answer) {
      if (answer.deptID.length > 0 && answer.deptName.length > 0 && answer.deptCosts.length > 0) {
        connection.query("INSERT INTO departments SET ?",
          {
            department_id: answer.deptID,
            department_name: answer.deptName,
            over_head_costs: answer.deptCosts
          }, function (err, res) {
            if (err) { throw error };
            console.log(chalk.yellow("\n\n       Success! New Department has been added.\n\n"));
            return viewDept();
          })
      } else {
        console.log(chalk.blue("\n\n\n\n       Error: Please re-enter information.\n\n\n\n"));
        return addDept();
      }
    })
}