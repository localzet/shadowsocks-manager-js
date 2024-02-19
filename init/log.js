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

const fs = require('fs');
const os = require('os');
const path = require('path');
const ssmgrPath = path.resolve(os.homedir(), '.ssmgr');
const logPath = path.resolve(os.homedir(), '.ssmgr', 'logs');
const log4js = require('log4js');

const category = [
    'system',
    'account',
    'email',
    'telegram',
    'freeAccount',
    'webgui',
    'alipay',
    'express',
    'flowSaver',
    'paypal',
    'giftcard',
    'autoban',
];

const configure = {
    appenders: {
        console: {type: 'console'},
        filter: {type: 'logLevelFilter', appender: 'console', level: 'debug'}
    },
    categories: {
        default: {appenders: ['console'], level: 'debug'},
    },
    disableClustering: true,
};

log4js.configure(configure);

const setConsoleLevel = level => {
    configure.appenders.filter = {type: 'logLevelFilter', appender: 'console', level};
    log4js.configure(configure);
};

const setFileAppenders = (filename) => {
    try {
        fs.statSync(ssmgrPath);
    } catch (err) {
        fs.mkdirSync(ssmgrPath);
    }
    try {
        fs.statSync(logPath);
    } catch (err) {
        fs.mkdirSync(logPath);
    }
    try {
        fs.statSync(path.resolve(logPath, filename));
    } catch (err) {
        fs.mkdirSync(path.resolve(logPath, filename));
    }
    for (const ctg of category) {
        configure.appenders[ctg] = {
            type: 'dateFile',
            filename: path.resolve(logPath, filename, ctg + '.log'),
            pattern: '-yyyy-MM-dd',
            compress: true,
        };
        configure.categories[ctg] = {appenders: [ctg, 'filter'], level: 'debug'};
    }
    log4js.configure(configure);
};

exports.setConsoleLevel = setConsoleLevel;
exports.setFileAppenders = setFileAppenders;
