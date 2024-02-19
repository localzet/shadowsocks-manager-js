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
const path = require('path');
const config = appRequire('services/config').all();

const log4js = require('log4js');
const logger = log4js.getLogger('system');

const pluginLists = [];

const loadOnePluginDb = name => {
    const promises = [];
    logger.info(`Load plugin db: [ ${name} ]`);
    try {
        const files = fs.readdirSync(path.resolve(__dirname, `../plugins/${name}`));
        if (files.indexOf('db') >= 0) {
            const dbFiles = fs.readdirSync(path.resolve(__dirname, `../plugins/${name}/db`));
            dbFiles.forEach(f => {
                logger.info(`Load plugin db: [ ${name}/db/${f} ]`);
                promises.push(appRequire(`plugins/${name}/db/${f}`).createTable());
            });
        }
    } catch (err) {
        logger.error(err);
    }
    return Promise.all(promises).then(() => {
        const dependence = appRequire(`plugins/${name}/dependence`);
        logger.info(`Load plugin dependence: [ ${name} ]`);
        dependence.forEach(pluginName => {
            if (pluginLists.indexOf(pluginName) < 0) {
                pluginLists.push(pluginName);
            }
        });
    }).catch(err => {
        // logger.error(err);
    });
};

const loadOnePlugin = name => {
    logger.info(`Load plugin: [ ${name} ]`);
    appRequire(`plugins/${name}/index`);
};

const loadPlugins = () => {
    if (!config.plugins) {
        return;
    }
    if (config.type !== 'm') {
        return;
    }
    for (const name in config.plugins) {
        if (config.plugins[name].use) {
            pluginLists.push(name);
        }
    }
    (async () => {
        for (let pl of pluginLists) {
            await loadOnePluginDb(pl);
        }
        for (let pl of pluginLists) {
            loadOnePlugin(pl);
        }
    })();
};
loadPlugins();
