require('dotenv').config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var figlet = require('figlet');
var boxen = require('boxen');
var Table = require('cli-table3');
var moment = require('moment');

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
  console.log(chalk.bold.green("\n                  - Customer -\n\r\n\r\n\r\n\r"))

  // 
  connection.connect(function (err) {
    if (err) { throw err };
    
    customer();
  });
});

function customer() {
  inquirer.prompt({
    name: "customer",
    type: "list",
    message: "How may I help you?",
    choices: ["[Shopping]", "[Exit]"]
  })
    .then(function (answer) {
      switch (answer.customer) {
        case "[Shopping]":
          shop()
          break;
        case "[Exit]":
          connection.end();
          process.exit();
          break;
      }
    });
}
function shop() {

 
  let table = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
  });

  // gather all product data

  connection.query("SELECT * FROM products", function (err, res) {
    if (err) { throw err };
    // console.log(res);
    for (let i = 0; i < res.length; i++) {
      let prodArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
      table.push(prodArr);
    };
    console.log(chalk.red("\n\n\n\n                              products table\n") + table.toString() + "\n\n\n\n");
    return purchase();
  })
}

// updating sql database

function purchase() {
  inquirer.prompt([
    {
      name: "id",
      type: "input",
      message: "Please enter the product ID:"
    }, {
      name: "quantity",
      type: "input",
      message: "Please enter a quantity:"
    }
  ]).then(function (answer) {
    connection.query("SELECT * FROM products WHERE ?", { item_id: answer.id }, function (err, response) {
      if (err) { throw err };

      // read customer input

      let idArr = [];
      for (var k = 0; k < response.length; k++) {
        idArr.push(response[k].item_id);
      }

      if (idArr.indexOf(parseInt(answer.id)) === -1) {
        console.log(chalk.yellowBright("\n\n    Error: Invalid product ID. Please re-enter.\n\n"));
        return purchase();
      }

     // checking quantity of items

      else if (answer.quantity.length < 1 || parseInt(response[0].stock_quantity) < parseInt(answer.quantity)) {
        console.log(
          boxen("Product Name       " + chalk.bold.green(response[0].product_name + ' (' + response[0].item_id + ')\n') +
            "Price      " + chalk.bold.red('$ ' + response[0].price + "\n") +
            "Quantity   " + chalk.bold.white(response[0].stock_quantity + " left"), { backgroundColor: "black", borderColor: "white", padding: 1, margin: 1, borderStyle: 'classic' }) +
          chalk.yellowBright("\n     LOW STOCK - Select a lower quantity please. \n\r\n\r\n\r\n\r")
        )
        return purchase();
      }

      // update database if all conditions are met by input


      else {
        let newStock = parseFloat(response[0].stock_quantity) - parseFloat(answer.quantity);

        connection.query("UPDATE products SET ? WHERE ?",
          [{ stock_quantity: newStock }, { item_id: answer.id }],
          function (err, update) {
            if (err) { throw err; };

            // customer reciept 
            let totalPrice = parseInt(answer.quantity) * parseFloat(response[0].price);
            console.log(
              "\n\n       ................. ORDER DETAILS ................." +
              "\n\n         " + response[0].product_name + " ............ $ " + response[0].price +
              "\n         Purchased ............ x " + answer.quantity +
              "\n         ...Sales total: " + chalk.yellow.underline(totalPrice.toFixed(2)) +
              "\n         Time: " + moment().format() +
              "\n\n         Thank you for shopping at the Bamazon Store!\n\n" +
              "       ...........................................\n\n")

            // udpating database with customer sales information
            let totalSales = response[0].product_sales + totalPrice
            connection.query("UPDATE products SET ? WHERE ?", [{ product_sales: totalSales }, { item_id: answer.id }],
              function (err, sales) { if (err) { throw err; }; }
            );

            return customer();
          }
        );
      }
    });
  });
}