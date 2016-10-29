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
    showProducts();
    console.log("---------------------------------------------");
    setTimeout(runCheckOut, 1000);
});

var runCheckOut = function() {
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "What itemID would you like to purchase?"
    }, {
        name: "quantity",
        type: "type",
        message: "How many?"
    }]).then(function(answer) {
        var updateStock;
        connection.query("SELECT * FROM products WHERE ?", {
            ItemID: answer.item
        }, function(err, res) {
            updateStock = res[0].StockQuantity - parseInt(answer.quantity);
            connection.query("UPDATE products SET ? WHERE ?", [{
                StockQuantity: parseInt(updateStock)
            }, {
                ItemID: answer.item
            }], function(err, res) {
                console.log(res + "\nStock has been deducted to " + updateStock);
                showProducts();
                console.log("---------------------------------------------");
                setTimeout(runCheckOut, 1000);
            });
            // Working on this to try and add price to the current value in the table
            connection.query("SELECT TotalSales FROM departments WHERE ?", {
                DepartmentName: res[0].DepartmentName
            }, function(err, res) {
              console.log(res);
              // connection.query("UPDATE departments SET ? WHERE ?", [{
              //     TotalSales: res[0].TotalSales + (res[0].Price * answer.quantity)
              // }, {
              //     DepartmentName: res[0].DepartmentName
              // }], function(err, res) {
              //     console.log("Total Sales updated!");
              // });
            });
        });

    });

};

var showProducts = function() {
    console.log('\nHere is the catalog: \n\nProductID || Product Name || Deparment || Price || Stock\n');
    var query = 'SELECT * FROM products';
    connection.query(query, function(err, res) {
        res.forEach(function(item, index) {
            console.log(item.ItemID + ' || ' + item.ProductName + ' || ' + item.DepartmentName + ' || ' + item.Price + ' || ' + item.StockQuantity);
        });
    });
};
