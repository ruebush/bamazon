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
// welcome screen

figlet('Bamazon', function (err, data) {
  if (err) { console.dir(err); return };
  console.log("\r\n\r\n "
    + boxen(chalk.bold.white(data), { backgroundColor: "blue", borderColor: "white", padding: 1, margin: 1, borderStyle: 'round' }))
  console.log(chalk.bold.green("\n                  - Manager -\n\r\n\r\n\r\n\r"))

  // 
  connection.connect(function (err) {
    if (err) { throw err };
    
    manager();
  });
});

// allow for manager to check item and stock information in the db

function manager() {
  inquirer.prompt({
    name: "manager",
    type: "list",
    message: "Please select an option from the list below:",
    choices: ["[View Products for Sale]", "[View Inventory]", "[Add Inventory]", "[Add New Product]", "[Exit]"]
  })
    .then(function (answer) {
      switch (answer.manager) {
        case "[View Products for Sale]":
          viewAll()
          break;
        case "[View Inventory]":
          viewLow()
          break;
        case "[Add Inventory]":
          addLow()
          break;
        case "[Add New Product]":
          addNew()
          break;
        case "[Exit]":
          connection.end();
          process.exit();
          break;
      }
    });
}


function viewAll() {


  let table = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
  });

  // push product data to table

  connection.query("SELECT * FROM products", function (err, res) {
    if (err) { throw err };
    // console.log(res);
    for (let i = 0; i < res.length; i++) {
      let prodArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
      table.push(prodArr);
    };
    console.log(chalk.red("\n\n\n\n                              products table\n") + table.toString() + "\n\n\n\n");
    return manager();
  })
}

// check low inventory

function viewLow() {

  
  let table2 = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
  });

  
  connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 50", function (err, res) {
    if (err) { throw err };
    // console.log(res);
    for (let i = 0; i < res.length; i++) {
      let lowArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
      table2.push(lowArr);
    };
    console.log(chalk.red("\n\n\n\n                              Low Inventory\n") + table2.toString() + "\n\n\n\n");
    return manager();
  })
}

// add new stock to low items

function addLow() {
  inquirer.prompt([{
    name: "id",
    type: "input",
    message: "Enter the ID of the product you would like to re-stock: "
  }, {
    name: "addQuantity",
    type: "input",
    message: "How many would you like to add?: "
  }]).then(function (answer) {
    if (answer.id.length < 1 || answer.addQuantity.length < 1 || parseFloat(answer.addQuantity) === NaN) {
      console.log(chalk.yellowBright("\n\n    Invalid Entry, please try again."));
      console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
      return addLow();
    } else {
      
      connection.query("SELECT * FROM products WHERE ?",
        { item_id: answer.id }, function (err, res) {
          if (err) { throw err; };
         


          let upId = answer.id;
          let upQuantity = parseFloat(answer.addQuantity) + parseFloat(res[0].stock_quantity);


          connection.query("UPDATE products SET ? WHERE ?",
            [{ stock_quantity: upQuantity }, { item_id: upId }], function (err, update) {
              if (err) { throw err; };
              // console.log(res);
              console.log(chalk.green("\n\n       All Set. Items have been re-stocked.\n\r"));
              return viewLow();
            }
          );
        });
    }
  })
}

// adding created data to the database

function addNew() {
  inquirer.prompt([{
    name: "id",
    type: "input",
    message: "Enter a new 'item_id': "
  }, {
    name: "name",
    type: "input",
    message: "Enter a new 'product_name': "
  }, {
    name: "dept",
    type: "input",
    message: "Enter a new 'department_name': ",
  }, {
    name: "price",
    type: "input",
    message: "Enter a new 'price': "
  }, {
    name: "quantity",
    type: "input",
    message: "Enter a new 'stock_quantity': "
  }]).then(function (answer) {
    if (answer.id.length < 1 || answer.dept.length < 1 || answer.price.length < 1 || answer.quantity.length < 1 || parseFloat(answer.price) === NaN || parseFloat(answer.quantity) === NaN) {
      console.log(chalk.yellowBright("\n\n    Error. Please enter the data again."));
      console.log(chalk.cyan("\n Return to Menu > \n\r\n\r\n\r\n\r"));
      return addNew();
    } else {
      connection.query("INSERT INTO products SET ?", {
        item_id: answer.id,
        product_name: answer.name,
        department_name: answer.dept,
        price: answer.price,
        stock_quantity: answer.quantity
      }, function (err, res) {
        if (err) { throw err; };
        console.log(chalk.green("\n\n       Product Added Successfully.\n\r\n\r"));
        return viewAll();
      });
    }
  });
}