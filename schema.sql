DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INTEGER AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    product_sales DECIMAL(10, 2),
    PRIMARY KEY (item_id)
);

CREATE TABLE departments (
	department_id INTEGER AUTO_INCREMENT,
	department_name VARCHAR(200) NOT NULL,
	over_head_costs DECIMAL(10 , 2) NOT NULL,
    product_sales DECIMAL(10 , 2),
    total_profit DECIMAL(10 , 2),
    PRIMARY KEY (department_id)
    );
    
    