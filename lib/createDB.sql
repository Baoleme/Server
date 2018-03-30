SET GLOBAL time_zone = '+8:00';
SET time_zone = '+8:00';
CREATE DATABASE baoleme;
ALTER DATABASE baoleme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use baoleme;

CREATE TABLE restaurant (
  `restaurant_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(50) NOT NULL,
  `password` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`restaurant_id`),
  UNIQUE (`email`)
);

CREATE TABLE customer (
  `customer_id` INT UNSIGNED NOT NULL AUTO_INCREMENT
)
