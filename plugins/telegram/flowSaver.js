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

const cron = appRequire('init/cron');
const knex = appRequire('init/knex').knex;
const serverManager = appRequire('plugins/telegram/serverManager');
const manager = appRequire('services/manager');
const moment = require('moment');
const log4js = require('log4js');
const logger = log4js.getLogger('telegram');

const getFlow = (host, port, start, end) => {
  return knex('saveFlow').innerJoin('server', 'server.id', 'saveFlow.id')
  .sum('flow as sumFlow')
  .groupBy('saveFlow.port')
  .select(['saveFlow.port as port'])
  .where({
    'server.host': host,
    'server.port': port,
  })
  .whereBetween('time', [start, end]);
};

const saveFlow = async () => {
  try {
    const servers = await serverManager.list();
    const promises = [];
    const saveServerFlow = async server => {
      const lastestFlow = await knex('saveFlow').select(['time']).where({
        id: server.id,
      }).orderBy('time', 'desc').limit(1);
      if(lastestFlow.length === 0 || Date.now() - lastestFlow[0].time >= 60000) {
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
        const insertPromises = [];
        for(let i = 0; i < Math.ceil(flow.length / 50); i++) {
          const insert = knex('saveFlow').insert(flow.slice(i * 50, i * 50 + 50));
          insertPromises.push(insert);
        }
        await Promise.all(insertPromises);
      }
    };
    servers.forEach(server => {
      promises.push(saveServerFlow(server));
    });
    await Promise.all(promises);
  } catch(err) {
    logger.error(err);
    return;
  }
};

cron.minute(() => {
  saveFlow();
}, 'TelegramSaveFlow', 1);

exports.getFlow = getFlow;
