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

const yaml = require('js-yaml');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const _ = require('lodash');

const log4js = require('log4js');
const logger = log4js.getLogger('system');

let config;

const defaultPath = path.resolve(os.homedir() + '/.ssmgr/default.yml');
let configFilePath = defaultPath;
if(global.configFile) {
  if(fs.existsSync(path.resolve(global.configFile))) {
    configFilePath = path.resolve(global.configFile);
  } else if(fs.existsSync(path.resolve(os.homedir() + '/.ssmgr/' + global.configFile))) {
    configFilePath = path.resolve(os.homedir() + '/.ssmgr/' + global.configFile);
  } else {
    logger.error(`Can not find file: ${ global.configFile }`);
    process.exit(1);
  }
}

try {
  logger.info('Config file path: ', configFilePath);
  const configFileData = fs.readFileSync(configFilePath);
  if(configFilePath.substr(configFilePath.length - 5) === '.json') {
    config = JSON.parse(configFileData);
  } else {
    config = yaml.safeLoad(configFileData, 'utf8');
  }
} catch (err) {
  logger.error(err);
}

exports.all = () => {
  return config;
};

exports.get = (path) => {
  if(!config) {
    return;
  }
  return _.get(config, path);
};

exports.set = (path, value) => {
  return _.set(config, path, value);
};
