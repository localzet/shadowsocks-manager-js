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

const orderPlugin = appRequire('plugins/webgui_order');
const accountPlugin = appRequire('plugins/account');
const groupPlugin = appRequire('plugins/group');

exports.getOrders = async (req, res) => {
    try {
        const orders = await orderPlugin.getOrdersAndAccountNumber();
        const ordersSorted = orders.filter(f => f.baseId === 0);
        orders.filter(f => f.baseId).forEach(order => {
            let spliceMark;
            ordersSorted.forEach((os, index) => {
                if (order.baseId === os.id) {
                    spliceMark = index + 1;
                }
            });
            ordersSorted.splice(spliceMark, 0, order);
        });
        res.send(ordersSorted);
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.getOneOrder = async (req, res) => {
    try {
        const orderId = +req.params.orderId;
        const order = await orderPlugin.getOneOrder(orderId);
        res.send(order);
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.newOrder = async (req, res) => {
    try {
        const data = {};
        data.baseId = req.body.baseId || 0;
        data.name = req.body.name;
        data.shortComment = req.body.shortComment;
        data.comment = req.body.comment;
        data.type = req.body.type;
        data.cycle = req.body.cycle;
        data.alipay = req.body.alipay;
        data.paypal = req.body.paypal;
        data.flow = req.body.flow;
        data.refTime = req.body.refTime;
        data.server = req.body.server;
        data.autoRemove = req.body.autoRemove;
        data.autoRemoveDelay = req.body.autoRemoveDelay;
        data.portRange = req.body.portRange;
        data.multiServerFlow = req.body.multiServerFlow;
        data.changeOrderType = req.body.changeOrderType;
        data.active = req.body.active;
        const orderId = await orderPlugin.newOrder(data);
        await groupPlugin.editMultiGroupForOrder(orderId, req.body.group || []);
        res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.editOrder = async (req, res) => {
    try {
        const data = {};
        data.baseId = +req.body.baseId || 0;
        data.id = +req.params.orderId;
        data.name = req.body.name;
        data.shortComment = req.body.shortComment;
        data.comment = req.body.comment;
        data.type = req.body.type;
        data.cycle = req.body.cycle;
        data.alipay = req.body.alipay;
        data.paypal = req.body.paypal;
        data.flow = req.body.flow;
        data.refTime = req.body.refTime;
        data.server = req.body.server;
        data.autoRemove = req.body.autoRemove;
        data.autoRemoveDelay = req.body.autoRemoveDelay;
        data.portRange = req.body.portRange;
        data.multiServerFlow = req.body.multiServerFlow;
        data.changeOrderType = req.body.changeOrderType;
        data.active = req.body.active;
        await orderPlugin.editOrder(data);
        const changeCurrentAccount = req.body.changeCurrentAccount;
        const update = {};
        if (changeCurrentAccount.flow) {
            update.flow = data.flow;
        }
        if (changeCurrentAccount.server) {
            update.server = data.server;
        }
        if (changeCurrentAccount.autoRemove) {
            update.autoRemove = data.autoRemove;
        }
        await groupPlugin.editMultiGroupForOrder(data.id, req.body.group || []);
        accountPlugin.editMultiAccounts(data.id, update);
        res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = +req.params.orderId;
        await orderPlugin.deleteOrder(orderId);
        res.send('success');
    } catch (err) {
        console.log(err);
        const errorData = ['account with this order exists', 'giftcard with this order exists'];
        if (errorData.indexOf(err) < 0) {
            return res.status(403).end();
        } else {
            return res.status(403).end(err);
        }
    }
};
