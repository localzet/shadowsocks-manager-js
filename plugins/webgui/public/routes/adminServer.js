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
    .state('admin.server', {
      url: '/server',
      controller: 'AdminServerController',
      templateUrl: `${ cdn }/public/views/admin/server.html`,
    })
    .state('admin.serverPage', {
      url: '/server/:serverId',
      controller: 'AdminServerPageController',
      templateUrl: `${ cdn }/public/views/admin/serverPage.html`,
    })
    .state('admin.addServer', {
      url: '/addServer',
      controller: 'AdminAddServerController',
      templateUrl: `${ cdn }/public/views/admin/addServer.html`,
      params: {
        type: 'Shadowsocks',
        name: null,
        comment: null,
        address: null,
        port: null,
        password: null,
        method: 'aes-256-cfb',
        scale: 1,
        shift: 0,
        key: null,
        net: null,
        wgPort: null,
        tjPort: null,
        tags: null,
      },
    })
    .state('admin.editServer', {
      url: '/server/:serverId/edit',
      controller: 'AdminEditServerController',
      templateUrl: `${ cdn }/public/views/admin/editServer.html`,
    });
  }])
;
