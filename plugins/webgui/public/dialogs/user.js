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

app.factory('userSortDialog', ['$mdDialog', '$http', ($mdDialog, $http) => {
    const publicInfo = {};
    $http.get('/api/admin/group').then(success => {
        publicInfo.groups = success.data;
        publicInfo.groups.unshift({id: -1, name: '所有组', comment: ''});
    });
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
        templateUrl: `${cdn}/public/views/admin/userSortDialog.html`,
        escapeToClose: false,
        locals: {bind: publicInfo},
        bindToController: true,
        controller: ['$scope', '$mdDialog', '$localStorage', 'bind', '$mdMedia', function ($scope, $mdDialog, $localStorage, bind, $mdMedia) {
            $scope.publicInfo = bind;
            $scope.userSort = $localStorage.admin.userSortSettings;
            if (!$scope.userSort.type) {
                $scope.userSort.type = {};
            }
            $scope.setDialogWidth = () => {
                if ($mdMedia('xs') || $mdMedia('sm')) {
                    return {};
                }
                return {'min-width': '350px'};
            };
        }],
        clickOutsideToClose: true,
    };
    const show = id => {
        publicInfo.id = id;
        if (isDialogShow()) {
            return dialogPromise;
        }
        dialogPromise = $mdDialog.show(dialog);
        return dialogPromise;
    };
    return {
        show,
        hide,
    };
}]);
