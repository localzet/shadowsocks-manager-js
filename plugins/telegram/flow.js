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
const managerAddress = appRequire('plugins/telegram/managerAddress');
const flow = appRequire('plugins/telegram/flowSaver');

const log4js = require('log4js');
const logger = log4js.getLogger('telegram');

const flowNumber = (number) => {
  if(number < 1000) return number + ' B';
  else if(number < 1000 * 1000) return (number / 1000).toFixed(0) + ' KB';
  else if(number < 1000 * 1000 * 1000) return (number / 1000000).toFixed(1) + ' MB';
  else if(number < 1000 * 1000 * 1000 * 1000) return (number / 1000000000).toFixed(3) + ' GB';
};

const getFlow = (message, time) => {
  const start = Date.now() - time;
  const end = Date.now();
  flow.getFlow(managerAddress.get().host, managerAddress.get().port, start, end)
  .then(ports => {
    let str = '';
    if(ports.length === 0) {
      str = 'No flows.';
    } else {
      str += `${managerAddress.get().host}:${managerAddress.get().port}\n\n`;
      ports.forEach(port => {
        str += port.port + ', ' + flowNumber(port.sumFlow) + '\n';
      });
    }
    telegram.emit('send', message, str);
  }).catch(err => {
    logger.error(err);
  });
};

telegram.on('manager', message => {

  const minReg = new RegExp(/^flow(\d{0,2})min$/);
  const hourReg = new RegExp(/^flow(\d{0,2})hour$/);

  if(message.message.text === 'flow') {
    getFlow(message, 10 * 60 * 1000);
  } else if(message.message.text.match(minReg)) {
    const reg = message.message.text.match(minReg);
    const time = reg[1] * 60 * 1000;
    getFlow(message, time);
  } else if(message.message.text.match(hourReg)) {
    const reg = message.message.text.match(hourReg);
    const time = reg[1] * 60 * 60 * 1000;
    getFlow(message, time);
  }
});
