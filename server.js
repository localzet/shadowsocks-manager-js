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

const cluster = require('cluster');
if(!process.env.numCPUs) {
  process.env.numCPUs = 1;
}
if(process.argv.indexOf('--multiCore') > 1) {
  process.env.numCPUs = require('os').cpus().length;
}
require('./init/log');
const log4js = require('log4js');
const logger = log4js.getLogger('system');
if(cluster.isMaster) {
  logger.info(`System start[${ process.pid }].`);
} else {
  logger.info(`Worker start[${ process.pid }].`);
}

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error(`Caught exception:`);
  logger.error(err);
});

const startWorker = async () => {
  require('./init/utils');

  require('./init/moveConfigFile');
  require('./init/checkConfig');
  require('./init/knex');

  const initDb = require('./init/loadModels').init;
  const runShadowsocks = require('./init/runShadowsocks').run;
  await initDb();
  await runShadowsocks();
  require('./init/loadServices');
  require('./init/loadPlugins');
  process.send('Worker start');
};

if(cluster.isMaster) {
  process.env.mainWorker = 1;
  cluster.fork();
  cluster.on('message', (worker, message, handle) => {
    if(message === 'Worker start' && Object.keys(cluster.workers).length < (+process.env.numCPUs)) {
      cluster.fork();
    }
  });
  cluster.on('exit', (worker, code, signal) => {
    if(code === 0) { return; }
    logger.error(`worker [${ worker.process.pid }][${ worker.id }] died`);
    for(const w in cluster.workers) {
      process.env.mainWorker = w;
      break;
    }
    cluster.fork();
  });
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('line', input => {
    if(input === 'rs') {
      for(const w in cluster.workers) {
        cluster.workers[w].kill();
        break;
      }
    }
  });
} else {
  startWorker();
}


