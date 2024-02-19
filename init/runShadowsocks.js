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
const logger = log4js.getLogger('system');

const config = appRequire('services/config').all();

const spawn = require('child_process').spawn;

const run = async () => {
  let runParams = config.runShadowsocks;
  let type = 'libev';
  let method = 'aes-256-cfb';
  if(!runParams) {
    return;
  }
  if(typeof runParams === 'boolean' && runParams) {
    runParams = '';
  }
  if(runParams.includes(':')) {
    method = runParams.split(':')[1];
  }
  const pluginOptions = [
    ...(config.shadowsocks['plugin'] ? ['--plugin', config.shadowsocks['plugin']] : []),
    ...(config.shadowsocks['plugin-opts'] ? ['--plugin-opts', config.shadowsocks['plugin-opts']] : []),
  ];
  let shadowsocks;
  if(runParams.includes('python')) {
    type = 'python';
    const tempPassword = 'qwerASDF' + Math.random().toString().substr(2, 8);
    // there is no SIP003 support in the python port, so just ignore the pluginOptions
    shadowsocks = spawn('ssserver', ['-m', method, '-p', '65535', '-k', tempPassword, '--manager-address', config.shadowsocks.address]);
  } else if(runParams.includes('rust')) {
    type = 'rust';
    shadowsocks = spawn('ssmanager', [ '-m', method, '-U', '--manager-address', config.shadowsocks.address, ...pluginOptions]);
  } else {
    shadowsocks = spawn('ss-manager', [ '-v', '-m', method, '-u', '--manager-address', config.shadowsocks.address, ...pluginOptions]);
  }

  shadowsocks.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
  });

  shadowsocks.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
  });

  shadowsocks.on('close', (code) => {
    logger.error(`child process exited with code ${code}`);
  });
  logger.info(`Run shadowsocks (${type})`);
  return;
};

exports.run = run;
