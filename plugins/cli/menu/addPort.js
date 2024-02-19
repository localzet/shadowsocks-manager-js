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

'use strict';

const manager = appRequire('services/manager');
const index = appRequire('plugins/cli/index');

const inquirer = require('inquirer');

const menu = [{
    type: 'input',
    name: 'port',
    message: 'Enter port:',
    validate: function (value) {
        if (Number.isNaN(+value)) {
            return 'Please enter a valid port number.';
        } else if (+value <= 0 || +value >= 65536) {
            return 'Port number must between 1 to 65535.';
        } else {
            return true;
        }
    },
}, {
    type: 'input',
    name: 'password',
    message: 'Enter password:',
    validate: function (value) {
        if (value === '') {
            return 'You can not set an empty password.';
        } else {
            return true;
        }
    },
}];

const add = async () => {
    try {
        const addPort = await inquirer.prompt(menu);
        await manager.send({
            command: 'add',
            port: +addPort.port,
            password: addPort.password,
        }, index.getManagerAddress());
        return;
    } catch (err) {
        return Promise.reject(err);
    }
};

exports.add = add;
