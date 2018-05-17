const orderModel = require('../model/order');
const restaurantService = require('./restaurantAccount');
const tableService = require('./table');
const dishService = require('./dish');
const assert = require('../../lib/assert');
const _ = require('lodash');

exports.createOrder = async (customer_id, info) => {
  // 确认餐厅和桌子存在
  const tables = await tableService.getAll(info.restaurant_id);
  assert(tables.includes(info.table), '桌号不存在');
  // 总价格
  let price = 0;
  const dishes = [];
  // 对于用户下单的每个菜品
  for (const one of info.dish) {
    const specAnswer = one.specifications;
    const dish = await dishService.getOne(one.dish_id);
    // 确认菜品存在
    assert(dish, `菜品${one.dish_id}不存在`);
    // 确认菜品属于这个餐厅
    assert(dish.restaurant_id === info.restaurant_id, `菜品${one.dish_id}不属于餐厅${info.restaurant_id}`);
    dish.specifications = JSON.parse(dish.specifications);
    dish.image_url = JSON.parse(dish.image_url);
    // 确认规格数量和选项合法
    let priceDelta = 0;
    let specificationName = [];
    assert(dish.specifications.length === specAnswer.length, `菜品${one.dish_id}的规格数量错误`);
    assert(specAnswer.every((selected, index) => {
      const thatSpec = dish.specifications[index];
      return selected <= thatSpec.options.length - 1;
    }), `菜品${one.dish_id}的选项不存在`);
    // 计算当前规格对于价格的影响 并 生成规格描述
    for (const [index, spec] of dish.specifications.entries()) {
      const selectedOption = spec.options[one.specifications[index]];
      priceDelta += selectedOption.delta;
      specificationName.push(selectedOption.name);
    }
    const dishPrice = dish.price + priceDelta;
    dishes.push({
      name: dish.name,
      specifications: specificationName.join('\\'),
      price: dishPrice,
      count: one.count,
      image_url: dish.image_url.length ? dish.image_url[0] : 'https://api.baoleme.andiedie.cn/files/default-dish.png'
    });
    // 计算总价
    price += dishPrice * one.count;
  }
  assert(price === info.price, `价格错误，应该为${price}`);
  const order = {
    customer_id,
    restaurant_id: info.restaurant_id,
    price,
    table: info.table,
    dish: JSON.stringify(dishes),
    remark: info.remark
  };
  const { insertId } = await orderModel.createOrder(order);
  await orderModel.updateState(insertId, orderModel.ORDER_STATE.CREATED);
  return insertId;
};

exports.getCustomerOrder = async (customer_id, since, number) => {
  const orders = await orderModel.getCustomerOrder(customer_id, since, number);
  for (const one of orders) {
    one.customer = {
      customer_id: one.customer_id
    };
    one.restaurant = _(one)
      .pick(['restaurant_email', 'restaurant_confirm_email', 'restaurant_name', 'restaurant_logo_url', 'restaurant_description', 'restaurant_phone', 'restaurant_license_url'])
      .mapKeys((value, key) => key.substr(11))
      .value();
    one.restaurant.restaurant_id = one.restaurant_id;
    one.dish = JSON.parse(one.dish);
    ['restaurant_email', 'restaurant_confirm_email', 'restaurant_name', 'restaurant_logo_url', 'restaurant_description', 'restaurant_phone', 'restaurant_license_url', 'customer_id', 'restaurant_id'].forEach(key => delete one[key]);
  }
  return orders;
};

exports.getCompleteInfomation = async id => {
  const order = await exports.getOne(id);
  assert(order, '订单不存在');
  const restaurant = await restaurantService.getInformationById(order.restaurant_id);
  order.customer = {
    customer_id: order.customer_id
  };
  order.restaurant = restaurant;
  delete order.customer_id;
  delete order.restaurant_id;
  order.dish = JSON.parse(order.dish);
  const record = (await orderModel.getState(id, 1))[0];
  order.state = record.state;
  order.time = record.time;
  return order;
};

exports.pay = async (customer_id, order_id) => {
  const order = await exports.getOne(order_id);
  assert(order, '订单不存在');
  assert(order.customer_id === customer_id, '只能支付自己的订单');
  const oldState = (await orderModel.getState(order_id, 1))[0].state;
  assert(oldState !== orderModel.ORDER_STATE.CREATED, '无法支付该订单');
  await orderModel.updateState(order_id, orderModel.ORDER_STATE.PAID);
  await orderModel.updateOrder(order_id, {
    payment: 'DreamPay'
  });
};

exports.getRestaurantOrder = async (restaurant_id, since, number) => {
  const orders = await orderModel.getRestaurantOrder(restaurant_id, since, number);
  const restaurant = await restaurantService.getInformationById(restaurant_id);
  for (const one of orders) {
    one.customer = {
      customer_id: one.customer_id
    };
    one.restaurant = restaurant;
    delete one.customer_id;
    delete one.restaurant_id;
    one.dish = JSON.parse(one.dish);
  }
  return orders;
};

exports.updateOrderState = async (restaurant_id, order_id, state) => {
  const order = await exports.getOne(order_id);
  assert(order, '订单不存在');
  assert(order.restaurant_id === restaurant_id, '只能处理自己的订单');
  assert([
    orderModel.ORDER_STATE.ACCEPTED,
    orderModel.ORDER_STATE.CANCELLED,
    orderModel.ORDER_STATE.COMPLETED
  ].includes(state), '状态不合法');
  const oldState = (await orderModel.getState(order_id, 1))[0].state;
  if (state === orderModel.ORDER_STATE.ACCEPTED) {
    assert(oldState === orderModel.ORDER_STATE.PAID, '只能接已支付状态的订单');
  }
  if (state === orderModel.ORDER_STATE.COMPLETED) {
    assert(oldState === orderModel.ORDER_STATE.ACCEPTED, '只能完成已接单的订单');
  }
  await orderModel.updateState(order_id, state);
};

exports.getLastState = async order_id => {
  assert(await exports.exist(order_id), '订单不存在');
  return (await orderModel.getState(order_id, 1))[0].state;
};

exports.exist = async id => {
  return Boolean(await orderModel.getOne(id));
};

exports.getOne = async id => {
  return orderModel.getOne(id);
};
