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

app.factory('addGiftCardBatchDialog', ['$mdDialog', '$http', ($mdDialog, $http) => {
    const publicInfo = {
        status: 'show',
        count: 20,
        orderId: 3,
    };

    $http.get('/api/admin/order').then(success => {
        publicInfo.orderList = success.data;
    });

    let dialogPromise = null;
    const isDialogShow = () => dialogPromise && !dialogPromise.$$state.status;

    const show = () => {
        if (isDialogShow()) {
            return dialogPromise;
        }
        publicInfo.status = 'show';
        dialogPromise = $mdDialog.show(dialog);
        return dialogPromise;
    };

    const close = () => {
        $mdDialog.hide();
        dialogPromise = null;
    };

    const submit = () => {
        publicInfo.status = 'loading';
        $http.post('/api/admin/giftcard/add', {
            count: publicInfo.count,
            orderId: publicInfo.orderId,
            comment: publicInfo.comment,
        })
            .then(() => close())
            .catch(err => {
                publicInfo.status = 'error';
            });
    };
    publicInfo.close = close;
    publicInfo.submit = submit;

    const dialog = {
        templateUrl: `${cdn}/public/views/dialog/addGiftCardBatch.html`,
        escapeToClose: true,
        locals: {bind: publicInfo},
        bindToController: true,
        controller: ['$scope', 'bind', ($scope, bind) => {
            $scope.publicInfo = bind;
        }],
        clickOutsideToClose: false,
    };
    return {show};
}]);
