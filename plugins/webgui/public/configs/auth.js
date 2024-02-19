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

const app = angular.module('app');
const window = require('window');

app
    .service('authInterceptor', ['$q', '$localStorage', function ($q, $localStorage) {
        const service = this;
        service.responseError = function (response) {
            if (response.status === 401) {
                $localStorage.home = {};
                $localStorage.admin = {};
                $localStorage.user = {};
                $localStorage.app = {};
                if (window.location.pathname.startsWith('/app')) {
                    window.location = '/app/loading';
                    return;
                }
                window.location = '/';
            }
            return $q.reject(response);
        };
    }])
    .config(['$httpProvider', '$compileProvider', ($httpProvider, $compileProvider) => {
        $httpProvider.interceptors.push('authInterceptor');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|ss|blob):/);
        $httpProvider.interceptors.push(['$q', $q => {
            return {
                request: function (config) {
                    if (config.url.match(/^\/api\//)) {
                        config.url = window.api + config.url;
                        config.withCredentials = true;
                    }
                    return config || $q.when(config);
                }
            };
        }]);
    }])
;
