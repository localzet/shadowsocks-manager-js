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
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const ssmgrPath = path.resolve(os.homedir(), './.ssmgr/');

const configFiles = [
  'default.yml',
];

const log4js = require('log4js');
const logger = log4js.getLogger('system');

try {
  fs.statSync(ssmgrPath);
} catch(err) {
  logger.info('~/.ssmgr/ not found, make dir for it.');
  fs.mkdirSync(ssmgrPath);
}
configFiles.forEach(configFile => {
  try {
    fs.statSync(path.resolve(ssmgrPath, configFile));
  } catch(err) {
    logger.info(`~/.ssmgr/${ configFile } not found, make file for it.`);
    fse.copySync(path.resolve(`./config/${ configFile }`), path.resolve(ssmgrPath, configFile));
  }
});
