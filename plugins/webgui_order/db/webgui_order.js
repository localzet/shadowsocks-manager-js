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
const tableName = 'webgui_order';

const addDefaultOrder = async () => {
    const data = await knex('webgui_order').where({}).then(s => s[0]);
    if (!data) {
        const oldData = await knex('webguiSetting').where({key: 'payment'}).then(s => JSON.parse(s[0].value));
        const types = {
            2: 'week',
            3: 'month',
            4: 'day',
            5: 'hour',
            6: 'season',
            7: 'year',
        };
        const insertData = [];
        for (const type in types) {
            let cycle = 1;
            if (+type === 6) {
                cycle = 3;
            }
            if (+type === 7) {
                cycle = 12;
            }
            insertData.push({
                id: type,
                name: oldData[types[type]].orderName || types[type],
                type: type <= 5 ? type : 3,
                cycle,
                alipay: oldData[types[type]].alipay || 99,
                paypal: oldData[types[type]].paypal || 99,
                autoRemove: oldData[types[type]].autoRemove ? 1 : 0,
                multiServerFlow: oldData[types[type]].multiServerFlow ? 1 : 0,
                changeOrderType: 1,
                flow: oldData[types[type]].flow * 1000 * 1000 || 1000 * 1000 * 1000,
                server: oldData[types[type]].server ? JSON.stringify(oldData[types[type]].server) : null,
                refTime: 0,
            });
        }
        await knex(tableName).insert(insertData);
    }
    return;
};

const fixRefTime = async () => {
    await knex.schema.alterTable(tableName, function (table) {
        table.bigInteger('refTime').alter();
    });
};

const createTable = async () => {
    const exist = await knex.schema.hasTable(tableName);
    if (exist) {
        const hasAutoRemoveDelay = await knex.schema.hasColumn(tableName, 'autoRemoveDelay');
        if (!hasAutoRemoveDelay) {
            await knex.schema.table(tableName, function (table) {
                table.bigInteger('autoRemoveDelay').defaultTo(0);
            });
        }
        const hasPortRange = await knex.schema.hasColumn(tableName, 'portRange');
        if (!hasPortRange) {
            await knex.schema.table(tableName, function (table) {
                table.string('portRange').defaultTo('0');
            });
        }
        const hasShortComment = await knex.schema.hasColumn(tableName, 'shortComment');
        if (!hasShortComment) {
            await knex.schema.table(tableName, function (table) {
                table.string('shortComment').defaultTo('');
            });
        }
        const hasBaseId = await knex.schema.hasColumn(tableName, 'baseId');
        if (!hasBaseId) {
            await knex.schema.table(tableName, function (table) {
                table.integer('baseId').defaultTo(0);
            });
        }
        const hasActive = await knex.schema.hasColumn(tableName, 'active');
        if (!hasActive) {
            await knex.schema.table(tableName, function (table) {
                table.integer('active').defaultTo(1);
            });
        }
        await addDefaultOrder();
        await fixRefTime();
        return;
    }
    await knex.schema.createTable(tableName, function (table) {
        table.increments('id').primary();
        table.integer('baseId').defaultTo(0);
        table.string('name');
        table.string('shortComment').defaultTo('');
        table.string('comment', 16384).defaultTo('');
        table.integer('type');
        table.integer('cycle');
        table.float('alipay');
        table.float('paypal');
        table.bigInteger('flow');
        table.bigInteger('refTime');
        table.string('server');
        table.integer('autoRemove').defaultTo(0);
        table.bigInteger('autoRemoveDelay').defaultTo(0);
        table.string('portRange').defaultTo('0');
        table.integer('multiServerFlow').defaultTo(0);
        table.integer('changeOrderType').defaultTo(0);
        table.integer('active').defaultTo(1);
    });
    await addDefaultOrder();
    return;
};

exports.createTable = createTable;
