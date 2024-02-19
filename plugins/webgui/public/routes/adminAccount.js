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
        .state('admin.account', {
            url: '/account',
            controller: 'AdminAccountController',
            templateUrl: `${cdn}/public/views/admin/account.html`,
        })
        .state('admin.accountPage', {
            url: '/account/:accountId',
            controller: 'AdminAccountPageController',
            templateUrl: `${cdn}/public/views/admin/accountPage.html`,
        })
        .state('admin.addAccount', {
            url: '/addAccount',
            controller: 'AdminAddAccountController',
            templateUrl: `${cdn}/public/views/admin/addAccount.html`,
        })
        .state('admin.editAccount', {
            url: '/account/:accountId/edit',
            controller: 'AdminEditAccountController',
            templateUrl: `${cdn}/public/views/admin/editAccount.html`,
        });
}])
;
