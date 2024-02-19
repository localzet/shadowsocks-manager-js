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
const tableName = 'user';

const createTable = async() => {
  const exist = await knex.schema.hasTable(tableName);
  if(!exist) {
    await knex.schema.createTable(tableName, function(table) {
      table.increments('id').primary();
      table.string('username').unique();
      table.string('email');
      table.string('telegram');
      table.string('password');
      table.string('type');
      table.bigInteger('createTime');
      table.bigInteger('lastLogin');
      table.string('resetPasswordId');
      table.bigInteger('resetPasswordTime');
      table.integer('group').defaultTo(0);
      table.string('comment').defaultTo('');
      table.string('crisp');
    });
  }
  const users = await knex('user').select(['id']);
  if(users.length === 0 && config.plugins.webgui.admin_username && config.plugins.webgui.admin_password) {
    const user = appRequire('plugins/user/index');
    await user.add({
      username: config.plugins.webgui.admin_username,
      email: config.plugins.webgui.admin_username,
      password: config.plugins.webgui.admin_password,
      type: 'admin',
      group: 0,
    });
  }
  const hasCrisp = await knex.schema.hasColumn(tableName, 'crisp');
  if(!hasCrisp) {
    await knex.schema.table(tableName, function(table) {
      table.string('crisp');
    });
  }
};

exports.createTable = createTable;
