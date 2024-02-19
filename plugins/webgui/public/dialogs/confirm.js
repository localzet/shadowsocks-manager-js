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

app.factory('confirmDialog' , [ '$mdDialog', ($mdDialog) => {
  const publicInfo = { status: 'show' };
  let dialogPromise = null;
  const isDialogShow = () => {
    if(dialogPromise && !dialogPromise.$$state.status) {
      return true;
    }
    return false;
  };
  const show = (options = {}) => {
    publicInfo.status = 'show';
    const { text, cancel, confirm, error, fn, useFnErrorMessage } = options;
    publicInfo.text = text;
    publicInfo.cancel = cancel;
    publicInfo.confirm = confirm;
    publicInfo.error = error;
    publicInfo.useFnErrorMessage = useFnErrorMessage;
    publicInfo.fn = fn;
    if(isDialogShow()) {
      return dialogPromise;
    }
    dialogPromise = $mdDialog.show(dialog);
    return dialogPromise;
  };
  const cancelFn = () => {
    return $mdDialog.cancel().then(success => {
      dialogPromise = null;
      return;
    }).catch(err => {
      dialogPromise = null;
      return;
    });
  };
  const hideFn = () => {
    return $mdDialog.hide().then(success => {
      dialogPromise = null;
      return;
    }).catch(err => {
      dialogPromise = null;
      return;
    });
  };
  publicInfo.cancelFn = cancelFn;
  const confirmFn = () => {
    publicInfo.status = 'loading';
    publicInfo.fn().then(success => {
      hideFn();
    }).catch(err => {
      publicInfo.status = 'error';
      if(publicInfo.useFnErrorMessage) {
        publicInfo.error = err;
      }
    });
  };
  publicInfo.confirmFn = confirmFn;
  const dialog = {
    templateUrl: `${ cdn }/public/views/dialog/confirm.html`,
    escapeToClose: false,
    locals: { bind: publicInfo },
    bindToController: true,
    controller: ['$scope', 'bind', function($scope, bind) {
      $scope.publicInfo = bind;
    }],
    clickOutsideToClose: false,
  };
  return {
    show,
  };
}]);
