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

const _ = require('lodash');
const config = appRequire('services/config').all();
const isFlowSaverUse = _.get(config, 'plugins.flowSaver.use');
const inquirer = require('inquirer');
const listPort = appRequire('plugins/cli/menu/listPort');
const addPort = appRequire('plugins/cli/menu/addPort');
const listServer = appRequire('plugins/cli/menu/listServer');
const addServer = appRequire('plugins/cli/menu/addServer');
const flow = appRequire('plugins/cli/menu/flow');
const index = appRequire('plugins/cli/index');

const main = [
  {
    type: 'list',
    name: 'mainMeun',
    message: () => {
      return 'Main menu [' + index.getManagerAddress().host + ':' + index.getManagerAddress().port + ']';
    },
    choices: ['add port', 'list port'],
  }
];

if(isFlowSaverUse) {
  main[0].choices.push('add server', 'list server', 'flow');
}

const mainMeun = () => {
  console.log();
  inquirer.prompt(main)
  .then(success => {
    if(success.mainMeun === 'list port') {
      return listPort.list();
    } else if(success.mainMeun === 'add port') {
      return addPort.add();
    } else if(success.mainMeun === 'list server') {
      return listServer.list();
    } else if(success.mainMeun === 'add server') {
      return addServer.add();
    } else if(success.mainMeun === 'flow') {
      return flow.getFlow();
    }
  }).then(() => {
    return mainMeun();
  })
  .catch(() => {
    return mainMeun();
  });
};

mainMeun();
