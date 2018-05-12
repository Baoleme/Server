-- MySQL Script generated by MySQL Workbench
-- Sat May 12 16:18:24 2018
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema baoleme
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema baoleme
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `baoleme` DEFAULT CHARACTER SET utf8 ;
USE `baoleme` ;

-- -----------------------------------------------------
-- Table `baoleme`.`Restaurant`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Restaurant` (
  `restaurant_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `confirm_email` TINYINT NOT NULL DEFAULT 0,
  `password` VARCHAR(45) NOT NULL,
  `license_url` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(255) NOT NULL DEFAULT 'https://api.baoleme.andiedie.cn/files/default-logo.png',
  `description` TEXT NULL,
  `phone` VARCHAR(45) NULL,
  PRIMARY KEY (`restaurant_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`Customer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Customer` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE INDEX `openid_UNIQUE` (`openid` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`Category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Category` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `restaurant_id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`category_id`, `restaurant_id`),
  INDEX `fk_Category_Restaurant1_idx` (`restaurant_id` ASC),
  CONSTRAINT `fk_Category_Restaurant1`
    FOREIGN KEY (`restaurant_id`)
    REFERENCES `baoleme`.`Restaurant` (`restaurant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`Dish`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Dish` (
  `dish_id` INT NOT NULL AUTO_INCREMENT,
  `restaurant_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `price` DOUBLE NOT NULL,
  `specifications` TEXT NULL,
  `image_url` TEXT NULL,
  `description` TEXT NULL,
  `tag` TEXT NULL,
  PRIMARY KEY (`dish_id`),
  INDEX `fk_Dish_Category1_idx` (`category_id` ASC, `restaurant_id` ASC),
  CONSTRAINT `fk_Dish_Category1`
    FOREIGN KEY (`category_id` , `restaurant_id`)
    REFERENCES `baoleme`.`Category` (`category_id` , `restaurant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Order` (
  `order_id` INT ZEROFILL NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `restaurant_id` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `table` VARCHAR(45) NOT NULL,
  `payment` VARCHAR(45) NOT NULL,
  `dish` TEXT NOT NULL,
  `remark` TEXT NULL,
  PRIMARY KEY (`order_id`, `customer_id`, `restaurant_id`),
  INDEX `fk_Order_Customer1_idx` (`customer_id` ASC),
  INDEX `fk_Order_Restaurant1_idx` (`restaurant_id` ASC),
  CONSTRAINT `fk_Order_Customer1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `baoleme`.`Customer` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Order_Restaurant1`
    FOREIGN KEY (`restaurant_id`)
    REFERENCES `baoleme`.`Restaurant` (`restaurant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`Table`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`Table` (
  `restaurant_id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  INDEX `fk_QRcode_Restaurant1_idx` (`restaurant_id` ASC),
  UNIQUE INDEX `table_UNIQUE` (`name` ASC),
  CONSTRAINT `fk_QRcode_Restaurant1`
    FOREIGN KEY (`restaurant_id`)
    REFERENCES `baoleme`.`Restaurant` (`restaurant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `baoleme`.`OrderRecord`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `baoleme`.`OrderRecord` (
  `order_record_id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT ZEROFILL NOT NULL,
  `state` ENUM('paid', 'accepted', 'canceled', 'completed') NOT NULL DEFAULT 'paid',
  `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_record_id`, `order_id`),
  INDEX `fk_OrderRecord_Order1_idx` (`order_id` ASC),
  CONSTRAINT `fk_OrderRecord_Order1`
    FOREIGN KEY (`order_id`)
    REFERENCES `baoleme`.`Order` (`order_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
