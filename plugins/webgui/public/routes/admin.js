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
const cdn = window.cdn || '';

app.config(['$stateProvider', $stateProvider => {
    $stateProvider
        .state('admin', {
            url: '/admin',
            abstract: true,
            templateUrl: `${cdn}/public/views/admin/admin.html`,
            resolve: {
                myConfig: ['$http', 'configManager', ($http, configManager) => {
                    if (configManager.getConfig().version) {
                        return;
                    }
                    return $http.get('/api/home/login').then(success => {
                        configManager.setConfig(success.data);
                    });
                }]
            },
        })
        .state('admin.index', {
            url: '/index',
            controller: 'AdminIndexController',
            templateUrl: `${cdn}/public/views/admin/index.html`,
        })
        .state('admin.pay', {
            url: '/pay',
            controller: 'AdminPayController',
            templateUrl: `${cdn}/public/views/admin/pay.html`,
            params: {
                myPayType: null,
            },
        })
        .state('admin.recentSignup', {
            url: '/recentSignup',
            controller: 'AdminRecentSignupController',
            templateUrl: `${cdn}/public/views/admin/recentSignup.html`,
        })
        .state('admin.recentLogin', {
            url: '/recentLogin',
            controller: 'AdminRecentLoginController',
            templateUrl: `${cdn}/public/views/admin/recentLogin.html`,
        })
        .state('admin.topFlow', {
            url: '/topFlow',
            controller: 'AdminTopFlowController',
            templateUrl: `${cdn}/public/views/admin/topFlow.html`,
        })
        .state('admin.unfinished', {
            url: '/unfinished',
            templateUrl: `${cdn}/public/views/admin/unfinished.html`,
        });
}
]);
