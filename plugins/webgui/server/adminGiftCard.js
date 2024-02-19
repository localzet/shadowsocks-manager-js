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
const giftcard = appRequire('plugins/giftcard');
const log4js = require('log4js');
const logger = log4js.getLogger('webgui');

exports.addGiftCard = async (req, resp) => {
    const count = Number(req.body.count);
    const orderId = Number(req.body.orderId);
    const comment = req.body.comment;
    if (count === NaN || orderId === NaN || count === 0) {
        resp.status(400).send('Bad parameters').end();
        return;
    }
    try {
        const batchNumber = await giftcard.generateGiftCard(count, orderId, comment);
        resp.send({batchNumber: batchNumber});
    } catch (err) {
        logger.error(`添加充值码失败：${err.toString()}`);
        resp.status(500).send(err.toString()).end();
    }
};

exports.revokeBatch = async (req, resp) => {
    const batchNumber = Number(req.body.batchNumber);
    if (req.body.batchNumber != null && batchNumber !== NaN) {
        try {
            await giftcard.revokeBatch(batchNumber);
            resp.send('success');
        } catch (err) {
            logger.error(`无法收回批次 ${batchNumber}：${err.toString()}`);
            resp.status(500).end();
        }
    } else {
        resp.status(400).end();
    }
};

exports.listBatch = async (req, res) => {
    try {
        res.send(await giftcard.listBatch());
    } catch (err) {
        logger.error(`无法列出充值码：${err.toString()}`);
        res.status(500).end();
    }
};

exports.getBatchDetails = async (req, resp) => {
    const batchNumber = Number(req.params.batchNumber);
    if (req.params.batchNumber != null && batchNumber !== NaN) {
        try {
            const details = await giftcard.getBatchDetails(batchNumber);
            if (details != null)
                resp.send(details);
            else
                resp.send(404).end();
        } catch (err) {
            logger.error(`无法查询批次 ${batchNumber}：${err.toString()}`);
            resp.status(500).end();
        }
    } else {
        resp.status(400).end();
    }
};

exports.getOrders = async (req, res) => {
    try {
        const options = {};
        if (req.adminInfo.id === 1) {
            options.group = +req.query.group;
        } else {
            options.group = req.adminInfo.group;
        }
        options.page = +req.query.page;
        options.pageSize = +req.query.pageSize;
        options.start = req.query.start;
        options.end = req.query.end;
        const details = await giftcard.orderListAndPaging(options);
        res.send(details);
    } catch (err) {
        logger.error(err);
        res.status(500).end();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = +req.params.userId;
        const details = await giftcard.getUserOrders(userId);
        res.send(details);
    } catch (err) {
        logger.error(err);
        res.status(500).end();
    }
};

exports.useGiftCardForUser = async (req, res) => {
    try {
        const password = req.body.password;
        const userId = +req.body.userId;
        const accountId = req.body.accountId ? +req.body.accountId : null;
        const result = await giftcard.processOrder(userId, accountId, password);
        res.send(result);
    } catch (err) {
        logger.error(err);
        res.status(500).end();
    }
};
