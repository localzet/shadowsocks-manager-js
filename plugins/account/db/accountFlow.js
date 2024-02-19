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
const tableName = 'account_flow';

const createTable = async() => {
  const exist = await knex.schema.hasTable(tableName);
  if(exist) {
    await knex.schema.table(tableName, function(table) {
      table.index('id');
      table.index(['serverId', 'accountId']);
      table.index('updateTime');
      table.index('checkTime');
      table.index('nextCheckTime');
      table.index('checkFlowTime');
    });
    const hasCheckFlowTime = await knex.schema.hasColumn(tableName, 'checkFlowTime');
    if(!hasCheckFlowTime) {
      await knex.schema.table(tableName, function(table) {
        table.bigInteger('checkFlowTime').defaultTo(Date.now());
      });
    }
    return;
  }
  return knex.schema.createTable(tableName, function(table) {
    table.increments('id');
    table.integer('serverId');
    table.integer('accountId');
    table.integer('port');
    table.bigInteger('updateTime');
    table.bigInteger('checkTime');
    table.bigInteger('nextCheckTime');
    table.bigInteger('checkFlowTime').defaultTo(Date.now());
    table.bigInteger('autobanTime');
    table.bigInteger('flow').defaultTo(0);
    table.string('status').defaultTo('checked');

    table.index('id');
    table.index(['serverId', 'accountId']);
    table.index('updateTime');
    table.index('checkTime');
    table.index('nextCheckTime');
    table.index('checkFlowTime');
  });
};

exports.createTable = createTable;
