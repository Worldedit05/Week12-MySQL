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
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }).then(function(answer) {
        switch (answer.options) {
            case 'View Products for Sale':
                viewProducts(true, managerPrompt);
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            default:
                viewProducts(true, managerPrompt);
                break;
        }
    });
};
// Just in case we need to prompt the user to return to the main menu
var nextPrompt = function() {
    inquirer.prompt({
        name: "return",
        type: "list",
        message: "Return to the main menu?",
        choices: ["Yes", "No"]
    }).then(function(answer) {
        if (answer.return === "Yes") {
            managerPrompt();
        } else {
            return;
        }
    });
};
// Simple function to query and display all products in the table
var viewProducts = function(value, callback) {
    console.log('\nHere is the catalog: \n\nProductID || Product Name || Deparment || Price || Stock\n');
    var query = 'SELECT * FROM products';
    connection.query(query, function(err, res) {
        res.forEach(function(item, index) {
            console.log(item.ItemID + ' || ' + item.ProductName + ' || ' + item.DepartmentName + ' || ' + item.Price + ' || ' + item.StockQuantity);
        });
        console.log("---------------------------------------------");
        if (value) {
            callback();
        }
    });
};
// Query that filters based on low inventory
var lowInventory = function() {
    console.log('\nProducts with low stock ( < 5): \n\nProductID || Product Name || Deparment || Price || Stock\n');
    var query = 'SELECT * FROM products WHERE StockQuantity <= 5';
    connection.query(query, function(err, res) {
        res.forEach(function(item, index) {
            console.log(item.ItemID + ' || ' + item.ProductName + ' || ' + item.DepartmentName + ' || ' + item.Price + ' || ' + item.StockQuantity);
        });
        console.log("---------------------------------------------");
        managerPrompt();
    });
};
// Shows the product table and prompts the user to provide an ItemID and quantity to add to StockQuantity

var addInventory = function() {
    inquirer.prompt([{
        name: "itemSelection",
        type: "input",
        message: "Which itemID would you like to add inventory to?",
        validate: function(input) {
            // console.log(isNaN(input));
            var done = this.async();
            if (isNaN(input)) {
                console.log('\nPlease provide a valid number!');
                return;
            }
            done(null, true);
        }
    }, {
        name: "updateQty",
        type: "input",
        message: "How many?",
        validate: function(input) {
            // console.log(isNaN(input));
            var done = this.async();
            if (isNaN(input)) {
                console.log('\nPlease provide a valid number!');
                return;
            }
            done(null, true);
        }
    }]).then(function(answer) {
        var query = 'SELECT StockQuantity FROM products WHERE ?';
        connection.query(query, {
            ItemID: answer.itemSelection
        }, function(err, res) {
            var query = 'UPDATE products SET ? WHERE ?';
            connection.query(query, [{
                StockQuantity: res[0].StockQuantity + parseInt(answer.updateQty)
            }, {
                ItemID: answer.itemSelection
            }], function(err, res) {
                console.log("Inventory changed sucessfully - " + res.message);
                console.log("---------------------------------------------");
                managerPrompt();
            });

        });
    });
};

// Function that will allow the user to add a new item to the product table
var addProduct = function() {
    inquirer.prompt([{
        name: "product_name",
        type: "input",
        message: "What is the product name?"
    }, {
        name: "department_name",
        type: "input",
        message: "What product department does this item belong to?"
    }, {
        name: "price",
        type: "input",
        message: "What is the products price?"
    }, {
        name: "stock",
        type: "input",
        message: "What is the initial stock?"
    }]).then(function(answer) {
        inquirer.prompt({
            name: "confirm",
            type: "list",
            message: "Please check the product details and verify that the information is correct!\n" + answer.product_name + " " + answer.department_name + " " + answer.price + " " + answer.stock,
            choices: ["Yes", "No"]
        }).then(function(input) {
            if (input.confirm === "Yes") {
                var query = 'INSERT INTO products (ProductName, DepartmentName, Price, StockQuantity) VALUES ( "' + answer.product_name + '", "' + answer.department_name + '" , "' + answer.price + '" , "' + answer.stock + '");';
                connection.query(query, {}, function(err, res) {
                    console.log(res);
                    console.log("---------------------------------------------");
                    managerPrompt();
                });
            } else {
                managerPrompt();
            }
        });
    });
};
