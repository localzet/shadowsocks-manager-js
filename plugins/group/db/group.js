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
const tableName = 'group';

const addDefaultGroup = async () => {
  const data = await knex('group')
    .where({ id: 0 })
    .then(s => s[0]);
  if (!data) {
    const id = await knex('group').insert(
      { id: 0, name: '默认组', comment: '系统默认分组' },
    );
    if (id[0] !== 0) {
      await knex('group')
        .update({ id: 0 })
        .where({ id: id[0] });
    }
  }
  return;
};

const createTable = async () => {
  const exist = await knex.schema.hasTable(tableName);
  if (exist) {
    await addDefaultGroup();
    const hasShowNotice = await knex.schema.hasColumn(tableName, 'showNotice');
    if(hasShowNotice) {
      await knex.schema.table(tableName, function(table) {
        table.dropColumn('showNotice');
      });
    }
    return;
  }
  await knex.schema.createTable(tableName, function(table) {
    table.increments('id');
    table.string('name');
    table.string('comment');
    table.string('order');
    table.integer('multiAccount').defaultTo(0);
  });
  await addDefaultGroup();
  return;
};

exports.createTable = createTable;
