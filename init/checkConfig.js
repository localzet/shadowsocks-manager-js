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

const os = require('os');
const path = require('path');
const program = require('commander');
const version = appRequire('package').version;
const log = appRequire('init/log');

const log4js = require('log4js');
const logger = log4js.getLogger('system');

const ssmgrPath = path.resolve(os.homedir(), './.ssmgr/');

program
  .version('shadowsocks-manager ' + version)
  .option('-c, --config [file]', 'config file, default: ~/.ssmgr/default.yml')
  .option('-d, --db [file]', 'sqlite3 file, sample: ~/.ssmgr/db.sqlite')
  .option('-t, --type [type]', 'type, s for server side, m for manager side')
  .option('-s, --shadowsocks [address]', 'ss-manager address, sample: 127.0.0.1:6001')
  .option('-m, --manager [address]', 'manager address, sample: 0.0.0.0:6002')
  .option('-p, --password [password]', 'manager password, both server side and manager side must be equals')
  .option('-r, --run [type]', 'run shadowsocks from child_process, sample: libev / libev:aes-256-cfb / python / python:aes-256-cfb')
  .option('--debug', 'show debug message')
  .option('--multiCore', 'multi core')
  .option('--isGfwUrl [isGfwUrl]', 'custom gfw status url')
  .parse(process.argv);

if(program.config) { global.configFile = program.config; }

if(!program.debug) {
  log.setConsoleLevel('ERROR');
}

const config = appRequire('services/config');
let logName = 'uname';

if(program.type) {config.set('type', program.type);}
if(program.shadowsocks) {config.set('shadowsocks.address', program.shadowsocks);}
if(program.manager) {config.set('manager.address', program.manager);}
if(program.password) {config.set('manager.password', program.password);}
if(program.db) {config.set('db', program.db);}
if(program.isGfwUrl) {config.set('isGfwUrl', program.isGfwUrl);}
if (typeof config.get('db') === 'object') {
  logName = config.get('db.database');
} else {
  const dbpath = config.get('db');
  logName = path.basename(dbpath).split('.')[0];
  if (dbpath[0] === '/' || dbpath[0] === '.' || dbpath[0] === '~') {
	  config.set('db', path.resolve(dbpath));
  } else {
	  config.set('db', path.resolve(ssmgrPath, dbpath));
  }
}
log.setFileAppenders(logName);

if(program.run) {
  config.set('runShadowsocks', program.run);
}
