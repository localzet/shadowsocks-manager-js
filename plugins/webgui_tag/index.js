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

const getTags = async (type, key) => {
  if(key) {
    return knex('tag').select(['name']).where({ type, key }).then(success => success.map(m => m.name));
  }
  return knex('tag').select(['name']).where({ type }).groupBy('name').then(success => success.map(m => m.name));
};

const setTags = async (type, key, tags) => {
  const currentTags = await knex('tag').select(['id', 'name']).where({ type, key });
  for(const ct of currentTags) {
    if(!tags.includes(ct.name)) {
      await knex('tag').delete().where({ id: ct.id });
    }
  }
  const newTags = tags.filter(f => {
    return !currentTags.map(m => m.name).includes(f);
  }).map(tag => {
    return {
      type, key, name: tag,
    };
  });
  if(newTags.length) {
    await knex('tag').insert(newTags);
  }
};

const addTags = async (type, key, tags) => {
  const currentTags = await knex('tag').select(['id', 'name']).where({ type, key });
  const newTags = tags.filter(f => {
    return !currentTags.map(m => m.name).includes(f);
  }).map(tag => {
    return {
      type, key, name: tag,
    };
  });
  if(newTags.length) {
    await knex('tag').insert(newTags);
  }
};

const delTags = async (type, key, tags) => {
  for(const tag of tags) {
    await knex('tag').delete().where({ type, key, name: tag });
  }
};

exports.getTags = getTags;
exports.setTags = setTags;
exports.addTags = addTags;
exports.delTags = delTags;
