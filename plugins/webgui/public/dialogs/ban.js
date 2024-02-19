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

app.factory('banDialog', ['$mdDialog', ($mdDialog) => {
    const publicInfo = {
        banTime: 30,
    };
    const hide = () => {
        return $mdDialog.hide()
            .then(success => {
                dialogPromise = null;
                return;
            }).catch(err => {
                dialogPromise = null;
                return;
            });
    };
    publicInfo.hide = hide;
    let dialogPromise = null;
    const isDialogShow = () => {
        if (dialogPromise && !dialogPromise.$$state.status) {
            return true;
        }
        return false;
    };
    const dialog = {
        templateUrl: `${cdn}/public/views/dialog/ban.html`,
        escapeToClose: false,
        locals: {bind: publicInfo},
        bindToController: true,
        controller: ['$scope', '$state', '$http', '$mdDialog', '$mdMedia', '$q', 'bind', '$filter', function ($scope, $state, $http, $mdDialog, $mdMedia, $q, bind, $filter) {
            $scope.publicInfo = bind;
            $http.get(`/api/admin/account/${$scope.publicInfo.serverId}/${$scope.publicInfo.accountId}/ban`).then(success => {
                $scope.publicInfo.releaseTime = success.data.banTime;
            });
            $scope.publicInfo.ban = () => {
                $http.post(`/api/admin/account/${$scope.publicInfo.serverId}/${$scope.publicInfo.accountId}/ban`, {
                    time: $filter('ban')(+$scope.publicInfo.banTime) * 60 * 1000,
                }).then(success => {
                    $scope.publicInfo.hide();
                });
            };
            $scope.setDialogWidth = () => {
                if ($mdMedia('xs') || $mdMedia('sm')) {
                    return {'min-width': '325px'};
                }
                return {'min-width': '400px'};
            };
        }],
        fullscreen: false,
        clickOutsideToClose: true,
    };
    const show = (serverId, accountId) => {
        if (isDialogShow()) {
            return dialogPromise;
        }
        publicInfo.serverId = serverId;
        publicInfo.accountId = accountId;
        dialogPromise = $mdDialog.show(dialog);
        return dialogPromise;
    };
    return {
        show,
    };
}]);
