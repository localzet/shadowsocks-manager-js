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

const log4js = require('log4js');
const logger = log4js.getLogger('flowSaver');
const knex = appRequire('init/knex').knex;
const moment = require('moment');
const cron = appRequire('init/cron');

const generateFlow = async (type) => {
    try {
        let tableName;
        let interval;
        if (type === 'day') {
            tableName = 'saveFlowDay';
            interval = 24 * 3600 * 1000;
        }
        if (type === 'hour') {
            tableName = 'saveFlowHour';
            interval = 3600 * 1000;
        }
        if (type === '5min') {
            tableName = 'saveFlow5min';
            interval = 5 * 60 * 1000;
        }
        const count = await knex('saveFlow').count('id as count').then(success => success[0].count);
        if (!count) {
            return;
        }
        const recent = await knex(tableName).select().orderBy('time', 'DESC').limit(1).then(success => success[0]);
        let time;
        if (!recent) {
            const firstFlow = await knex('saveFlow').select().orderBy('time', 'ASC').limit(1).then(success => success[0]);
            if (type === 'day') {
                time = moment(firstFlow.time).hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
            }
            if (type === 'hour') {
                time = moment(firstFlow.time).minute(0).second(0).millisecond(0).toDate().getTime();
            }
            if (type === '5min') {
                const minute = moment(firstFlow.time).minute();
                time = moment(firstFlow.time).minute(minute - minute % 5).second(0).millisecond(0).toDate().getTime();
            }
        } else {
            time = recent.time + interval;
        }
        if (Date.now() - time < interval) {
            return;
        }
        let sum = await knex('saveFlow')
            .sum('flow as sumFlow')
            .groupBy(['port', 'id'])
            .select(['saveFlow.port as port'])
            .select(['saveFlow.id as id'])
            .select(['saveFlow.accountId as accountId'])
            .whereBetween('time', [time, time + interval]);
        if (!sum.length) {
            sum = [{id: 0, port: 0, flow: 0}];
        }
        logger.info(`Generate ${type} flow, length: ${sum.length}`);
        const insertPromises = [];
        for (let i = 0; i < Math.ceil(sum.length / 50); i++) {
            logger.info(`insert generate flow from ${i * 50} to ${i * 50 + 50}`);
            const insert = knex(tableName).insert(sum.slice(i * 50, i * 50 + 50).map(m => {
                return {
                    id: m.id,
                    accountId: m.accountId || 0,
                    port: m.port,
                    flow: m.sumFlow,
                    time,
                };
            }));
            insertPromises.push(insert);
        }
        await Promise.all(insertPromises);
        await knex(tableName).delete().where({
            id: 0,
        }).whereBetween('time', [0, time - 1]);
    } catch (err) {
        logger.error(err);
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 30 * 1000);
        });
    }
    await generateFlow(type);
};

cron.minute(async () => {
    knex('saveFlow').delete().whereBetween('time', [0, Date.now() - 48 * 3600 * 1000]).then();
    knex('saveFlowDay').delete().whereBetween('time', [0, Date.now() - 365 * 24 * 3600 * 1000]).then();
    knex('saveFlowHour').delete().whereBetween('time', [0, Date.now() - 30 * 24 * 3600 * 1000]).then();
    knex('saveFlow5min').delete().whereBetween('time', [0, Date.now() - 7 * 24 * 3600 * 1000]).then();
}, 'RemoveOldFlow', 37);
cron.minute(async () => {
    generateFlow('5min');
}, 'Generate5minFlow', 5);
cron.cron(() => {
    generateFlow('hour');
}, 'GenerateHourFlow', '1 * * * *', 3600);
cron.cron(() => {
    generateFlow('day');
}, 'GenerateDayFlow', '10 0 * * *', 24 * 3600);
