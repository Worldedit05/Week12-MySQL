var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Sucessful connection");
    managerPrompt();
});

var managerPrompt = function() {
    inquirer.prompt({
        name: "options",
        type: "rawlist",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }).then(function(answer) {
        switch (answer.options) {
            case 'View Products for Sale':
                viewProducts();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':

                break;
        }
    });
};

var viewProducts = function() {
    console.log('\nHere is the catalog: \n\nProductID || Product Name || Deparment || Price || Stock\n');
    var query = 'SELECT * FROM products';
    connection.query(query, function(err, res) {
        res.forEach(function(item, index) {
            console.log(item.ItemID + ' || ' + item.ProductName + ' || ' + item.DepartmentName + ' || ' + item.Price + ' || ' + item.StockQuantity);
        });
    });
};

var lowInventory = function() {
    var query = 'SELECT * FROM products WHERE StockQuantity <= 5';
    connection.query(query, function(err, res) {
      res.forEach(function(item, index) {
          console.log(item.ItemID + ' || ' + item.ProductName + ' || ' + item.DepartmentName + ' || ' + item.Price + ' || ' + item.StockQuantity);
      });
    });
};

var addInventory = function() {
    inquirer.prompt({
      name: "itemSelection",
      type: "input",
      message: "Which itemID would you like to add inventory to?",
      choices: function() {
        viewProducts();
      },
      validate: function (input) {
        // console.log(isNaN(input));
        if (isNaN(input)) {
          console.log('Please provide a valid number!');
          return;
        }
      }
    },{
      name: "updateQty",
      type: "input",
      message: "How many?",
      validate: function (input) {
        if (isNaN(input)) {
          done('Please provide a valid quantity!');
          return;
        }
      }
    }).then(function (answer){
      var updateStock;
      var query = 'UPDATE product SET ? WHERE ?';
      connection.query(query,[{
          StockQuantity: StockQuantity + answer.updateQty
      },{
          ItemID: answer.itemSelection
      }] ,function(err, res) {
          console.log(res);
      });
    }
  );
};
