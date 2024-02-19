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
const config = appRequire('services/config').all();
const account = appRequire('plugins/account/index');
const redis = appRequire('init/redis').redis;

const getNewPort = async () => {
  return knex('webguiSetting').select().where({
    key: 'account',
  }).then(success => {
    if(!success.length) { return Promise.reject('settings not found'); }
    success[0].value = JSON.parse(success[0].value);
    return success[0].value.port;
  }).then(port => {
    if(port.random) {
      const getRandomPort = () => Math.floor(Math.random() * (port.end - port.start + 1) + port.start);
      let retry = 0;
      let myPort = getRandomPort();
      const checkIfPortExists = port => {
        let myPort = port;
        return knex('account_plugin').select()
        .where({ port }).then(success => {
          if(success.length && retry <= 30) {
            retry++;
            myPort = getRandomPort();
            return checkIfPortExists(myPort);
          } else if (success.length && retry > 30) {
            return Promise.reject('Can not get a random port');
          } else {
            return myPort;
          }
        });
      };
      return checkIfPortExists(myPort);
    } else {
      return knex('account_plugin').select()
      .whereBetween('port', [port.start, port.end])
      .orderBy('port', 'ASC').then(success => {
        const portArray = success.map(m => m.port);
        let myPort;
        for(let p = port.start; p <= port.end; p++) {
          if(portArray.indexOf(p) < 0) {
            myPort = p; break;
          }
        }
        if(myPort) {
          return myPort;
        } else {
          return Promise.reject('no port');
        }
      });
    }
  });
};

const getRandomPassword = passowrdLength => {
  const passwordChars = '23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const password = Array(passowrdLength).fill(passwordChars).map(function(x) { return x[Math.floor(Math.random() * x.length)]; }).join('');
  return password;
};

const timeStr2Num = input => {
  const s = 1000;
  const m = 60 * 1000;
  const h = 60 * 60 * 1000;
  const d = 24 * 60 * 60 * 1000;
  if(!input) {
    return 0;
  } else if(Number.isInteger(+input)) {
    return +input;
  }else if(input.match(/^\d{1,}.?\d{0,}s$/)) {
    return +input.substr(0, input.length - 1) * s;
  } else if(input.match(/^\d{1,}.?\d{0,}m$/)) {
    return +input.substr(0, input.length - 1) * m;
  } else if(input.match(/^\d{1,}.?\d{0,}h$/)) {
    return +input.substr(0, input.length - 1) * h;
  } else if(input.match(/^\d{1,}.?\d{0,}d$/)) {
    return +input.substr(0, input.length - 1) * d;
  } else {
    return 1;
  }
};

const getPrevPort = async userId => {
  const prevInfo = await redis.get(`Account:${userId}`);
  let port;
  let password;
  if (prevInfo) {
    port = prevInfo.split(':')[0];
    password = prevInfo.split(':').slice(1).join(':');
    const ifExists = await knex('account_plugin').select().where({ port }).then(s => s[0]);
    if (ifExists) {
      port = null;
    }
  }
  return { port, password };
};

const setAccount = async userId => {
  if(!config.plugins.webgui_free_account || !config.plugins.webgui_free_account.use) {
    return;
  }
  const { interval, orderId } = config.plugins.webgui_free_account;
  const last = await knex('webgui_free_account').where({ userId }).orderBy('createTime', 'desc').limit(1).then(s => s[0]);
  if(last && Date.now() - last.createTime < timeStr2Num(interval)) {
    return;
  }
  const hasAccount = await knex('account_plugin').where({ userId }).then(s => s[0]);
  if(hasAccount) { return; }
  const orderInfo = await knex('webgui_order').where({ id: orderId, baseId: 0 }).then(s => s[0]);
  if(!orderInfo) { return; }
  let { port, password } = await getPrevPort(userId);
  if (!port) {
    port = await getNewPort();
    password = getRandomPassword(10);
  }
  await account.addAccount(orderInfo.type || 5, {
    user: userId,
    orderId: orderInfo.id,
    port,
    password,
    time: Date.now(),
    limit: orderInfo.cycle,
    flow: orderInfo.flow,
    server: orderInfo.server,
    autoRemove: orderInfo.autoRemove ? 1 : 0,
    multiServerFlow: orderInfo.multiServerFlow ? 1 : 0,
  });
  await knex('webgui_free_account').insert({ userId, createTime: Date.now() });
};

exports.setAccount = setAccount;
