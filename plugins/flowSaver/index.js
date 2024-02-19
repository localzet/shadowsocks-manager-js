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

const log4js = require('log4js');
const logger = log4js.getLogger('flowSaver');
appRequire('plugins/flowSaver/server');
appRequire('plugins/flowSaver/flow');
appRequire('plugins/flowSaver/generateFlow');
const accountFlow = appRequire('plugins/account/accountFlow');
const cron = appRequire('init/cron');
const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const minute = 1;
const time = minute * 60 * 1000;

const config = appRequire('services/config').all();
const isSQLite = typeof config.db === 'string';

let accountInfo = {};

const updateAccountInfo = async () => {
  const accounts = await knex('account_plugin').select().where({});
  accountInfo = {};
  accounts.forEach(account => {
    accountInfo[account.port] = account.id;
  });
  return;
};

const saveFlow = async () => {
  try {
    const servers = await knex('server').select(['id', 'name', 'host', 'port', 'password', 'shift']);
    await updateAccountInfo();
    const saveServerFlow = async server => {
      const lastestFlow = await knex('saveFlow').select(['time']).where({
        id: server.id,
      }).orderBy('time', 'desc').limit(1);
      if(lastestFlow.length === 0 || Date.now() - lastestFlow[0].time >= time) {
        const options = {
          clear: true,
        };
        let flow = await manager.send({
          command: 'flow',
          options,
        }, {
          host: server.host,
          port: server.port,
          password: server.password,
        });
        flow = flow.map(f => {
          return {
            id: server.id,
            accountId: accountInfo[f.port - server.shift] || 0,
            port: f.port,
            flow: f.sumFlow,
            time: Date.now(),
          };
        }).filter(f => {
          return f.flow > 0;
        });
        if(flow.length === 0) {
          return;
        }
        flow.forEach(async f => {
          await accountFlow.updateFlow(f.id, f.accountId, f.flow);
        });
        const splitNumber = isSQLite ? 25 : 75;
        for(let i = 0; i < Math.ceil(flow.length / splitNumber); i++) {
          const insertFlow = flow.slice(i * splitNumber, i * splitNumber + splitNumber);
          await knex('saveFlow').insert(insertFlow).catch();
          logger.info(`[server: ${ server.id }] insert ${ insertFlow.length } flow`);
        }
      }
    };
    for(const server of servers) {
      await saveServerFlow(server).catch(err => {
        logger.error(`[server: ${ server.id }] save flow error`);
      });
    }
  } catch(err) {
    logger.error(err);
    return;
  }
};

cron.minute(() => {
  saveFlow();
}, 'SaveFlow', 1);
