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

const flowSaverServer = appRequire('plugins/flowSaver/server');
const index = appRequire('plugins/cli/index');
const inquirer = require('inquirer');

const menu = [
  {
    type: 'list',
    name: 'server',
    message: 'Select server:',
    choices: [],
  }, {
    type: 'list',
    name: 'act',
    message: 'What do you want?',
    choices: ['Switch to it', 'Delete server', 'Edit server', 'Back'],
    when: function (answers) {
      if(answers.server === 'Back') {
        return Promise.resolve();
      } else {
        return answers;
      }
    }
  }
];

const editServer = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter server name:',
    validate: function (value) {
      if(value === '') {
        return 'You can not set an empty name.';
      } else {
        return true;
      }
    },
  }, {
    type: 'input',
    name: 'host',
    message: 'Enter server host:',
    validate: function (value) {
      if(value === '') {
        return 'You can not set an empty host.';
      } else {
        return true;
      }
    },
  }, {
    type: 'input',
    name: 'port',
    message: 'Enter server port:',
    validate: function (value) {
      if(Number.isNaN(+value)) {
        return 'Please enter a valid port number.';
      } else if (+value <= 0 || +value >= 65536) {
        return 'Port number must between 1 to 65535.';
      } else {
        return true;
      }
    }
  }, {
    type: 'input',
    name: 'password',
    message: 'Enter password:',
    validate: function (value) {
      if(value === '') {
        return 'You can not set an empty password.';
      } else {
        return true;
      }
    },
  }
];

const list = async () => {
  try {
    const listServer = await flowSaverServer.list();
    menu[0].choices = [];
    listServer.forEach(f => {
      const name =  '[' + f.id + '] ' + f.name + ' ' + f.host + ':' + f.port;
      const value = {
        id: f.id,
        name: f.name,
        host: f.host,
        port: f.port,
        password: f.password,
      };
      menu[0].choices.push({name, value});
    });
    menu[0].choices.push({name: 'Back', value: 'Back'});
    const selectServer = await inquirer.prompt(menu);
    if(selectServer.act === 'Switch to it') {
      index.setManagerAddress(selectServer.server.host, selectServer.server.port, selectServer.server.password);
      return;
    } else if (selectServer.act === 'Edit server') {
      editServer[0].default = selectServer.server.name;
      editServer[1].default = selectServer.server.host;
      editServer[2].default = selectServer.server.port;
      editServer[3].default = selectServer.server.password;
      const edit = await inquirer.prompt(editServer);
      await flowSaverServer.edit(selectServer.server.id, edit.name, edit.host, edit.port, edit.password);
      return;
    } else if (selectServer.act === 'Delete server') {
      await flowSaverServer.del(selectServer.server);
      return;
    } else if (selectServer.act === 'Back') {
      return;
    }
  } catch(err) {
    console.log(err);
    return Promise.reject(err);
  }
};

exports.list = list;
