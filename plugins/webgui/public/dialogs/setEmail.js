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

app.factory('setEmailDialog', ['$mdDialog', '$state', '$http', ($mdDialog, $state, $http) => {
    const publicInfo = {};
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
    const set = (title, content) => {
        load();
        $http.put('/api/admin/setting/mail', {
            type: publicInfo.emailType,
            title,
            content,
        }).then(success => {
            hide();
        }).catch(() => {
            publicInfo.isLoading = false;
        });
    };
    publicInfo.set = set;
    const get = () => {
        load();
        $http.get('/api/admin/setting/mail', {
            params: {
                type: publicInfo.emailType,
            }
        }).then(success => {
            publicInfo.title = success.data.title;
            publicInfo.content = success.data.content;
            publicInfo.isLoading = false;
        }).catch(() => {
            publicInfo.isLoading = false;
        });
    };
    publicInfo.get = get;
    let dialogPromise = null;
    const isDialogShow = () => {
        if (dialogPromise && !dialogPromise.$$state.status) {
            return true;
        }
        return false;
    };
    const dialog = {
        templateUrl: `${cdn}/public/views/dialog/setEmail.html`,
        escapeToClose: false,
        locals: {bind: publicInfo},
        bindToController: true,
        controller: ['$scope', '$mdMedia', '$mdDialog', '$http', 'bind', function ($scope, $mdMedia, $mdDialog, $http, bind) {
            $scope.publicInfo = bind;
            $scope.setDialogWidth = () => {
                if ($mdMedia('xs') || $mdMedia('sm')) {
                    return {};
                }
                return {'min-width': '400px'};
            };
        }],
        fullscreen: true,
        clickOutsideToClose: false,
    };
    const load = () => {
        publicInfo.isLoading = true;
    };
    const show = emailType => {
        publicInfo.title = '';
        publicInfo.content = '';
        publicInfo.isLoading = false;
        if (isDialogShow()) {
            return dialogPromise;
        }
        publicInfo.emailType = emailType;
        dialogPromise = $mdDialog.show(dialog);
        publicInfo.get();
        return dialogPromise;
    };
    return {
        show,
    };
}]);
