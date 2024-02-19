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

angular.module('app', [
    'ngMaterial',
    'ui.router',
    'ngMessages',
    'ja.qr',
    'chart.js',
    'angularMoment',
    'ngWebSocket',
    'ngStorage',
    'angular-inview',
    'hc.marked',
    'pascalprecht.translate',
    'ngclipboard',
]);

const addMeta = (name, content) => {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.getElementsByTagName('head')[0].appendChild(meta);
};

const window = require('window');
angular.element(() => {
    $.get(window.api + '/api/home/login').then(success => {
        window.ssmgrConfig = success;

        window.$crisp = [];
        window.CRISP_RUNTIME_CONFIG = {
            session_merge: true
        };
        window.CRISP_READY_TRIGGER = () => {
            const event = document.createEvent('Event');
            event.initEvent('crispReady', true, true);
            document.dispatchEvent(event);
        };
        window.CRISP_WEBSITE_ID = window.ssmgrConfig.crisp;

        require('./directives/focusMe');

        require('./services/preloadService.js');
        require('./services/adminService.js');
        require('./services/homeService.js');
        require('./services/userService.js');
        require('./services/configService.js');
        // require('./services/websocketService.js');

        require('./configs/index.js');
        require('./controllers/index.js');
        require('./dialogs/index.js');
        require('./filters/index.js');
        require('./translate/index.js');
        require('./routes/index.js');

        angular.bootstrap(document, ['app']);
    }).catch(err => {
        let time = 5000;
        if (err.status === 403) {
            time = 1500;
        } else {
            time += 500;
        }
        setTimeout(() => {
            location.reload();
        }, time);
    });
});
