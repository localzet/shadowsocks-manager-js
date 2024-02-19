/*
 * @package     ShadosSocks Manager
 * @link        https://github.com/localzet/shadowsocks-manager-js
 * @link        https://github.com/shadowsocks/shadowsocks-manager
 *
 * @author      Ivan Zorin <creator@localzet.com>
 * @copyright   Copyright (c) 2018-2024 Zorin Projects S.P.
 * @license     https://www.gnu.org/licenses/agpl-3.0 GNU Affero General Public License v3.0
 *
 *              This program is free software: you can redistribute it and/or modify
 *              it under the terms of the GNU Affero General Public License as published
 *              by the Free Software Foundation, either version 3 of the License, or
 *              (at your option) any later version.
 *
 *              This program is distributed in the hope that it will be useful,
 *              but WITHOUT ANY WARRANTY; without even the implied warranty of
 *              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *              GNU Affero General Public License for more details.
 *
 *              You should have received a copy of the GNU Affero General Public License
 *              along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *              For any questions, please contact <creator@localzet.com>
 */

const knex = appRequire('init/knex').knex;
const config = appRequire('services/config').all();

const getOrders = async () => {
  return knex('webgui_order').where({});
};

const getOrdersAndAccountNumber = async () => {
  const orders = await knex('webgui_order').select([
    'webgui_order.id as id',
    'webgui_order.baseId as baseId',
    'webgui_order.name as name',
    'webgui_order.shortComment as shortComment',
    'webgui_order.comment as comment',
    'webgui_order.type as type',
    'webgui_order.cycle as cycle',
    'webgui_order.alipay as alipay',
    'webgui_order.paypal as paypal',
    'webgui_order.flow as flow',
    'webgui_order.refTime as refTime',
    'webgui_order.server as server',
    'webgui_order.autoRemove as autoRemove',
    'webgui_order.autoRemoveDelay as autoRemoveDelay',
    'webgui_order.portRange as portRange',
    'webgui_order.multiServerFlow as multiServerFlow',
    'webgui_order.changeOrderType as changeOrderType',
    'webgui_order.autoRemove as autoRemove',
    knex.raw('count(account_plugin.id) as accountNumber'),
  ])
  .leftJoin('account_plugin', 'account_plugin.orderId', 'webgui_order.id')
  .groupBy('webgui_order.id')
  .orderBy('webgui_order.name', 'ASC');
  return orders;
};

const getOneOrder = async orderId => {
  const order = await knex('webgui_order').where({ id: orderId }).then(s => s[0]);
  if(!order) { return Promise.reject('order not found'); }
  return order;
};

const getOneOrderByAccountId = async accountId => {
  const order = await knex('webgui_order').select([
    'webgui_order.id as id',
    'webgui_order.changeOrderType as changeOrderType',
  ]).leftJoin('account_plugin', 'account_plugin.orderId', 'webgui_order.id')
  .where({ 'account_plugin.id': accountId }).then(s => s[0]);
  return order;
};

const newOrder = async data => {
  const [ id ] = await knex('webgui_order').insert({
    baseId: data.baseId,
    name: data.name,
    shortComment: data.shortComment,
    comment: data.comment,
    type: data.type,
    cycle: data.cycle,
    alipay: data.alipay,
    paypal: data.paypal,
    flow: data.flow,
    refTime: data.refTime,
    server: data.server ? JSON.stringify(data.server) : null,
    autoRemove: data.autoRemove,
    autoRemoveDelay: data.autoRemoveDelay,
    portRange: data.portRange,
    multiServerFlow: data.multiServerFlow,
    changeOrderType: data.changeOrderType,
    active: data.active,
  });
  return id;
};

const editOrder = async data => {
  await knex('webgui_order').update({
    baseId: data.baseId,
    name: data.name,
    shortComment: data.shortComment,
    comment: data.comment,
    type: data.type,
    cycle: data.cycle,
    alipay: data.alipay,
    paypal: data.paypal,
    flow: data.flow,
    refTime: data.refTime,
    server: data.server ? JSON.stringify(data.server) : null,
    autoRemove: data.autoRemove,
    autoRemoveDelay: data.autoRemoveDelay,
    portRange: data.portRange,
    multiServerFlow: data.multiServerFlow,
    changeOrderType: data.changeOrderType,
    active: data.active,
  }).where({
    id: data.id,
  });
  return;
};

const deleteOrder = async orderId => {
  const orderInfo = await knex('webgui_order').where({ id: orderId }).then(s => s[0]);
  if(orderInfo.baseId) {
    await knex('webgui_order').delete().where({ id: orderId });
  } else {
    const hasAccount = await knex('account_plugin').where({ orderId });
    if(hasAccount.length) { return Promise.reject('account with this order exists'); }
    const isGiftCardOn = config.plugins.giftcard && config.plugins.giftcard.use;
    const hasGiftcard = isGiftCardOn ? await knex('giftcard').where({ orderType: orderId, status: 'AVAILABLE' }) : [];
    if(hasGiftcard.length) { return Promise.reject('giftcard with this order exists'); }
    const hasFlowPackOrder = await knex('webgui_order').where({ baseId: orderId });
    if(hasFlowPackOrder.length) { return Promise.reject('flowpack order exists'); }
    await knex('webgui_order').delete().where({ id: orderId });
  }
  return;
};

exports.getOrders = getOrders;
exports.getOrdersAndAccountNumber = getOrdersAndAccountNumber;
exports.getOneOrder = getOneOrder;
exports.newOrder = newOrder;
exports.editOrder = editOrder;
exports.deleteOrder = deleteOrder;
exports.getOneOrderByAccountId = getOneOrderByAccountId;
