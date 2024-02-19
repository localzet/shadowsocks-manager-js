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
        .state('user', {
            url: '/user',
            abstract: true,
            templateUrl: `${cdn}/public/views/user/user.html`,
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
        .state('user.index', {
            url: '/index',
            controller: 'UserIndexController',
            templateUrl: `${cdn}/public/views/user/index.html`,
        })
        .state('user.account', {
            url: '/account',
            controller: 'UserAccountController',
            templateUrl: `${cdn}/public/views/user/account.html`,
        })
        .state('user.settings', {
            url: '/settings',
            controller: 'UserSettingsController',
            templateUrl: `${cdn}/public/views/user/settings.html`,
        })
        .state('user.changePassword', {
            url: '/changePassword',
            controller: 'UserChangePasswordController',
            templateUrl: `${cdn}/public/views/user/changePassword.html`,
        })
        .state('user.telegram', {
            url: '/telegram',
            controller: 'UserTelegramController',
            templateUrl: `${cdn}/public/views/user/telegram.html`,
        })
        .state('user.ref', {
            url: '/ref',
            controller: 'UserRefController',
            templateUrl: `${cdn}/public/views/user/ref.html`,
        })
        .state('user.order', {
            url: '/order',
            controller: 'UserOrderController',
            templateUrl: `${cdn}/public/views/user/order.html`,
        })
        .state('user.macAddress', {
            url: '/macAddress',
            controller: 'UserMacAddressController',
            templateUrl: `${cdn}/public/views/user/macAddress.html`,
        })
        .state('user.notice', {
            url: '/notice',
            controller: 'UserNoticeController',
            templateUrl: `${cdn}/public/views/user/notice.html`,
        })
    ;
}])
;
