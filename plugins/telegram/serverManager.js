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
const manager = appRequire('services/manager');

const add = options => {
  const { name, host, port, password } = options;
  return knex('server').insert({
    name,
    host,
    port,
    password
  });
};

const del = (id) => {
  return knex.transaction(trx => {
    return knex('server').transacting(trx).where({ id }).delete()
    .then(() => knex('saveFlow').transacting(trx).where({ id }).delete())
    .then(trx.commit)
    .catch(trx.rollback);
  });
};

const edit = options => {
  const { id, name, host, port, password } = options;
  return knex('server').where({ id }).update({
    name,
    host,
    port,
    password
  });
};

const list = async (options = {}) => {
  const serverList = await knex('server').select([
    'id',
    'name',
    'host',
    'port',
    'password',
    'method'
  ]).orderBy('name');
  return serverList;
};

exports.add = add;
exports.del = del;
exports.edit = edit;
exports.list = list;
