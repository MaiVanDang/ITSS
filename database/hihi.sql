
create database itss;
use itss ; 
create table user  (
id int auto_increment primary key,
username VARCHAR(50) NOT NULL,
email VARCHAR(255),
verified_time DateTime,
password VARCHAR(8) NOT NULL,
create_at DateTime NOT NULL,
update_at DateTime NOT NULL,
status INT NOT NULL,
avatar VARCHAR(255) ,
name VARCHAR(255),
gender VARCHAR(255),
address VARCHAR(255)
); 



create table ingredients(
id int auto_increment primary key,
name VARCHAR(255) NOT NULL,
image VARCHAR(2555),
description VARCHAR(255),
status INT,
create_at TIMESTAMP,
update_at TIMESTAMP
);

create table shopping_attribute (
id int auto_increment primary key,
user_id INT,
buy_at TIMESTAMP,
status INT NOT NULL,
exprided TIMESTAMP,
measure  VARCHAR(10),
quantity decimal(10,0)
);

create table dish(
id int auto_increment primary key,
image varchar(500),
name INT NOT NULL,
descriptions TEXT,
recipe_des TEXT NOT NULL,
status INT,
type varchar(255) not null,
create_at TIMESTAMP,
update_at TIMESTAMP
);
create table shopping(
	id int auto_increment primary key,
    code varchar(20) unique,
    create_at datetime,
    status int,
    user_id int,
    foreign key (user_id) references user(id)
);


create table dish_attribute(
id int auto_increment primary key,
dish_id INT NOT NULL,
expride TIMESTAMP,
cook_status int,
quantity int ,
shooping_id int,
cook_date timestamp,
create_at TIMESTAMP,
update_at TIMESTAMP, 
foreign key (dish_id) references dish(id),
foreign key (shopping_id) references shopping(id)
);

create table dish_ingredients(
id int auto_increment primary key,
dish_id INT NOT NULL, 
ingredients_id INT NOT NULL, 
foreign key (dish_id) references dish(id) , 
foreign key(ingredients_id) references ingredients(id)
);


create table group_table (
id int auto_increment primary key,
leader INT NOT NULL , 
name VARCHAR(255) NOT NULL, 
create_at TIMESTAMP , 
update_at TIMESTAMP , 
foreign key (leader) references user(id)
);

create table group_member(
id int auto_increment primary key,
group_id int not null , 
user_id int not null, 
foreign key (group_id) references user(id), 
foreign key (user_id) references group_table(id)
); 
create table group_shopping( 
id int auto_increment primary key,
group_id INT not null, 
shopping_id INT not null, 
foreign key	(group_id) references group_table(id), 
foreign key (shopping_id) references shopping(id)
); 

create table favorite( 
id int auto_increment primary key,
user_id int not null, 
recipe_id int not null, 
foreign key (user_id) references user(id), 
foreign key (recipe_id) references dish(id)
);

create table fridge (
id int auto_increment primary key,
name varchar(100) not null,
group_id int,
user_id int,
foreign key (group_id) references group_table(id),
foreign key (user_id) references user(id)
);
create table fridge_ingredients(
id int auto_increment primary key,
fridge_id int,
ingredients_id int,
quantity int,
foreign key (fridge_id) references fridge(id),
foreign key (ingredients_id) references ingredients(id)
)

