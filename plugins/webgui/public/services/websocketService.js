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

app.factory('ws', ['$websocket', '$location', '$timeout', ($websocket, $location, $timeout) => {
    const protocol = $location.protocol() === 'http' ? 'ws://' : 'wss://';
    const url = protocol + $location.host() + ':' + $location.port() + '/user';
    let connection = null;
    const messages = [];
    const connect = () => {
        connection = $websocket(url);
        connection.onMessage(function (message) {
            console.log(message.data);
            messages.push(message.data);
        });
        connection.onClose(() => {
            $timeout(() => {
                connect();
            }, 3000);
        });
    };
    connect();
    const methods = {
        messages,
        send: function (msg) {
            connection.send(msg);
        },
    };
    return methods;
}]);
