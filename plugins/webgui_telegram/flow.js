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
const moment = require('moment');
const flow = appRequire('plugins/flowSaver/flow');
const tg = appRequire('plugins/webgui_telegram/index');
const telegram = appRequire('plugins/webgui_telegram/index').telegram;
const cron = appRequire('init/cron');
const log4js = require('log4js');
const logger = log4js.getLogger('telegram');

const getUserAccount = userId => {
  return knex('account_plugin').where({
    userId
  });
};

const prettyFlow = number => {
  if(number >= 0 && number < 1000) {
    return number + ' B';
  } else if(number >= 1000 && number < 1000 * 1000) {
    return (number / 1000).toFixed(1) + ' KB';
  } else if(number >= 1000 * 1000 && number < 1000 * 1000 * 1000) {
    return (number / (1000 * 1000)).toFixed(2) + ' MB';
  } else if(number >= 1000 * 1000 * 1000 && number < 1000 * 1000 * 1000 * 1000) {
    return (number / (1000 * 1000 * 1000)).toFixed(3) + ' GB';
  } else if(number >= 1000 * 1000 * 1000 * 1000 && number < 1000 * 1000 * 1000 * 1000 * 1000) {
    return (number / (1000 * 1000 * 1000 * 1000)).toFixed(3) + ' TB';
  } else {
    return number + '';
  }
};

const getUsers = async () => {
  const users = await knex('user').where({ type: 'normal' }).whereNotNull('telegram');
  users.forEach(async user => {
    const accounts = await getUserAccount(user.id);
    const start = moment().add(-1, 'd').hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
    const end = moment().hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
    accounts.forEach(async account => {
      const myFlow = await flow.getFlowFromSplitTime(null, account.id, start, end);
      const message = `昨日流量统计：[${ account.port }] ${ prettyFlow(myFlow) }`;
      logger.info(message);
      // telegram.emit('send', +user.telegram, message);
      tg.sendMessage(message, +user.telegram);
    });
  });
};

cron.cron(getUsers, 'GetUsers', '0 9 * * *', 24 * 3600);
