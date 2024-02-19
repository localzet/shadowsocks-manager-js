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

const menu = [
    {
        type: 'list',
        name: 'port',
        message: 'Select port:',
        choices: [],
    }, {
        type: 'list',
        name: 'act',
        message: 'What do you want?',
        choices: ['Delete port', 'Change password', 'Back'],
        when: function (answers) {
            if (answers.port === 'Back') {
                return Promise.resolve();
            } else {
                return answers;
            }
        }
    }
];

const password = {
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
};

const listPort = async () => {
    try {
        const result = await manager.send({
            command: 'list',
        }, index.getManagerAddress());
        menu[0].choices = [];
        result.forEach(f => {
            const name = (f.port + '     ').substr(0, 5) + ', ' + f.password;
            const value = f.port;
            menu[0].choices.push({
                name,
                value,
            });
        });
        menu[0].choices.push({
            name: 'Back', value: 'Back'
        });
        return;
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    }
};

const list = async () => {
    try {
        await listPort();
        const selectPort = await inquirer.prompt(menu);
        if (selectPort.act === 'Delete port') {
            await manager.send({
                command: 'del',
                port: selectPort.port,
            }, index.getManagerAddress());
            return;
        } else if (selectPort.act === 'Change password') {
            const newPassword = await inquirer.prompt(password);
            await manager.send({
                command: 'pwd',
                port: selectPort.port,
                password: newPassword.password,
            }, index.getManagerAddress());
            return;
        } else if (selectPort.act === 'Back') {
            return;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    }
};

exports.list = list;
