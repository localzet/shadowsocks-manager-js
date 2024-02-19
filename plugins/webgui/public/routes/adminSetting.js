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
    .state('admin.settings', {
      url: '/settings',
      controller: 'AdminSettingsController',
      templateUrl: `${ cdn }/public/views/admin/settings.html`,
    })
    .state('admin.notice', {
      url: '/notice',
      controller: 'AdminNoticeController',
      templateUrl: `${ cdn }/public/views/admin/notice.html`,
    })
    .state('admin.editNotice', {
      url: '/notice/{noticeId:int}',
      controller: 'AdminEditNoticeController',
      templateUrl: `${ cdn }/public/views/admin/editNotice.html`,
    })
    .state('admin.addNotice', {
      url: '/notice/new',
      controller: 'AdminNewNoticeController',
      templateUrl: `${ cdn }/public/views/admin/newNotice.html`,
    })
    .state('admin.paymentList', {
      url: '/settings/paymentList',
      controller: 'AdminPaymentListController',
      templateUrl: `${ cdn }/public/views/admin/paymentList.html`,
    })
    .state('admin.editPayment', {
      url: '/settings/editPayment/:paymentType',
      controller: 'AdminEditPaymentController',
      templateUrl: `${ cdn }/public/views/admin/editPayment.html`,
    })
    .state('admin.baseSetting', {
      url: '/settings/base',
      controller: 'AdminBaseSettingController',
      templateUrl: `${ cdn }/public/views/admin/baseSetting.html`,
    })
    .state('admin.accountSetting', {
      url: '/settings/account',
      controller: 'AdminAccountSettingController',
      templateUrl: `${ cdn }/public/views/admin/accountSetting.html`,
    })
    .state('admin.mailSetting', {
      url: '/settings/mail',
      controller: 'AdminMailSettingController',
      templateUrl: `${ cdn }/public/views/admin/mailSetting.html`,
    })
    .state('admin.passwordSetting', {
      url: '/settings/password',
      controller: 'AdminPasswordSettingController',
      templateUrl: `${ cdn }/public/views/admin/changePassword.html`,
    })
    .state('admin.telegramSetting', {
      url: '/settings/telegram',
      controller: 'AdminTelegramSettingController',
      templateUrl: `${ cdn }/public/views/admin/telegramSetting.html`,
    })
    .state('admin.listGiftCardBatch', {
      url: '/settings/giftcard',
      controller: 'AdminGiftCardController',
      templateUrl: `${ cdn }/public/views/admin/giftcardBatchList.html`
    })
    .state('admin.giftcardBatchDetails', {
      url: '/settings/giftcard/batch/:batchNumber',
      controller: 'AdminGiftCardBatchDetailsController',
      templateUrl: `${ cdn }/public/views/admin/giftcardBatchDetails.html`
    })
    .state('admin.groupSetting', {
      url: '/settings/group',
      controller: 'AdminGroupSettingController',
      templateUrl: `${ cdn }/public/views/admin/groupList.html`
    })
    .state('admin.addGroup', {
      url: '/settings/addGroup',
      controller: 'AdminAddGroupController',
      templateUrl: `${ cdn }/public/views/admin/addGroup.html`
    })
    .state('admin.editGroup', {
      url: '/settings/editGroup/:groupId',
      controller: 'AdminEditGroupController',
      templateUrl: `${ cdn }/public/views/admin/editGroup.html`
    })
    .state('admin.refSetting', {
      url: '/settings/ref',
      controller: 'AdminRefSettingController',
      templateUrl: `${ cdn }/public/views/admin/refSetting.html`
    })
    .state('admin.refCodeList', {
      url: '/settings/refCodeList',
      controller: 'AdminRefCodeListController',
      templateUrl: `${ cdn }/public/views/admin/refCodeList.html`
    })
    .state('admin.editRefCode', {
      url: '/settings/refCode/:id',
      controller: 'AdminEditRefCodeController',
      templateUrl: `${ cdn }/public/views/admin/editRefCode.html`
    })
    .state('admin.refUserList', {
      url: '/settings/refUserList',
      controller: 'AdminRefUserListController',
      templateUrl: `${ cdn }/public/views/admin/refUserList.html`
    })
    .state('admin.myRefCode', {
      url: '/settings/myRefCode',
      controller: 'AdminMyRefCodeController',
      templateUrl: `${ cdn }/public/views/admin/myRefCode.html`
    })
    .state('admin.addRefUser', {
      url: '/settings/addRefUser',
      controller: 'AdminAddRefUserController',
      templateUrl: `${ cdn }/public/views/admin/addRefUser.html`
    })

    .state('admin.order', {
      url: '/settings/order',
      controller: 'AdminOrderSettingController',
      templateUrl: `${ cdn }/public/views/admin/orderSetting.html`
    })
    .state('admin.newOrder', {
      url: '/settings/newOrder',
      controller: 'AdminNewOrderController',
      templateUrl: `${ cdn }/public/views/admin/newOrder.html`
    })
    .state('admin.editOrder', {
      url: '/settings/editOrder/:id',
      controller: 'AdminEditOrderController',
      templateUrl: `${ cdn }/public/views/admin/editOrder.html`
    })
    ;
  }
]);
