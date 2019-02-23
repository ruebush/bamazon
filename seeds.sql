USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
('FIFA 19', 'Video Games', 50, 4),
('Guinness', 'Beer', 13.99, 10),
('Sweatshirt', 'Clothing', 25.99, 3),
('External HD', 'Computers', 50, 2),
('NBA 2K19', 'Video Games', 59.99, 1),
('Wireless Mouse', 'Computers', 14.99, 1),
('Jeans', 'Clothing', 100, 3),
('Bitburger', 'Beer', 5.99, 7),
('Super Smash Brothers Ultimate', 'Video Games', 59.99, 2),
('T Shirt', 'Clothing', 10, 1),
('Baltika', 'Beer', 7, 4),
('Apple iPad', 'Computers', 399.99, 2);

SELECT * FROM products;

INSERT INTO departments (department_name, over_head_costs) VALUES

('Video Games', 379.97),
('Clothing', 387.97),
('Computers', 912.99),
('Beer', 209.83);

SELECT * FROM departments;