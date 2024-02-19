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

app.factory('userApi', ['$q', '$http', ($q, $http) => {
    let userAccountPromise = null;
    const getUserAccount = () => {
        if (userAccountPromise && !userAccountPromise.$$state.status) {
            return userAccountPromise;
        }
        userAccountPromise = $q.all([
            $http.get('/api/user/account'),
            $http.get('/api/user/server'),
        ]).then(success => {
            return {
                account: success[0].data,
                servers: success[1].data.map(server => {
                    return server;
                }),
            };
        });
        return userAccountPromise;
    };

    const changeShadowsocksPassword = (accountId, password) => {
        return $http.put(`/api/user/${accountId}/password`, {
            password,
        });
    };

    const changePassword = (password, newPassword) => {
        return $http.post('/api/user/changePassword', {
            password,
            newPassword,
        });
    };

    const updateAccount = account => {
        if (!account.length) {
            return $http.get('/api/user/account').then(success => {
                success.data.forEach(a => {
                    account.push(a);
                });
            });
        } else {
            account.forEach((a, index) => {
                $http.get(`/api/user/account/${a.id}`).then(success => {
                    if (!success.data.id) {
                        account.splice(index, 1);
                        return;
                    }
                    a.password = success.data.password;
                    a.data = success.data.data;
                    a.type = success.data.type;
                });
            });
            return $q.resolve();
        }
    };

    let serverPortDataPromise = {};
    const getServerPortData = (account, serverId) => {
        if (serverPortDataPromise[`${account.id}`] && !serverPortDataPromise[`${account.id}`].$$state.status) {
            return serverPortDataPromise[`${account.id}`];
        }
        const Promises = [
            $http.get(`/api/user/flow/${serverId}/${account.id}/lastConnect`),
        ];
        if (account.type >= 1 && account.type <= 5) {
            Promises.push(
                $http.get(`/api/user/flow/${serverId}/${account.id}`)
            );
        }
        serverPortDataPromise[`${account.id}`] = $q.all(Promises).then(success => {
            return {
                lastConnect: success[0].data.lastConnect,
                flow: success[1] ? success[1].data[0] : null,
            };
        });
        return serverPortDataPromise[`${account.id}`];
    };

    const getNotice = () => {
        return $http.get('/api/user/notice').then(success => success.data);
    };

    const getUsage = () => {
        return $http.get('/api/user/usage').then(success => success.data);
    };

    return {
        getServerPortData,
        getUserAccount,
        changeShadowsocksPassword,
        changePassword,
        updateAccount,
        getNotice,
        getUsage,
    };
}]);
