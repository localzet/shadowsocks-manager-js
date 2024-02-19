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

const telegram = appRequire('plugins/telegram/index').telegram;
const knex = appRequire('init/knex').knex;

const log4js = require('log4js');
const logger = log4js.getLogger('telegram');

const setManager = async (message) => {
    try {
        const manager = await knex('telegram').select(['value']).where({
            key: 'manager'
        });
        if (manager.length === 0) {
            await knex('telegram').insert({
                key: 'manager',
                value: message.message.from.id,
            });
            telegram.emit('send', message, 'Authorize success.');
        } else if (+manager[0].value === message.message.from.id) {
            telegram.emit('send', message, 'This user is already a manager.');
        } else {
            telegram.emit('send', message, 'Authorize fail.');
        }
        return;
    } catch (err) {
        logger.error(err);
        return Promise.reject(err);
    }
};

const isManager = async (message) => {
    try {
        const manager = await knex('telegram').select(['value']).where({
            key: 'manager',
        });
        if (manager.length === 0) {
            telegram.emit('send', message, 'Send \'auth\' to become manager.');
        } else if (manager.length > 0 && manager[0].value === message.message.from.id + '') {
            telegram.emit('manager', message);
        }
    } catch (err) {
        logger.error(err);
        return Promise.reject(err);
    }
};

telegram.on('message', message => {
    if (message.message.text === 'auth') {
        setManager(message);
    } else {
        isManager(message);
    }
});
