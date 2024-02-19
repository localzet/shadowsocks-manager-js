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
const tableName = 'giftcard';

const createTable = async () => {
    const exist = await knex.schema.hasTable(tableName);
    if (exist) {
        return;
    }
    return knex.schema.createTable(tableName, function (table) {
        table.increments('id').primary();
        table.string('password').unique().notNull();
        table.integer('orderType').notNull();
        table.string('status').notNull();
        table.integer('batchNumber').notNull();
        table.integer('user');
        table.integer('account');
        table.bigInteger('createTime').notNull();
        table.bigInteger('usedTime');
        table.string('comment').defaultTo('');
    });
};

exports.createTable = createTable;
exports.tableName = tableName;
