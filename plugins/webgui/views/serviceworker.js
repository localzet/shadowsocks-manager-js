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

const ONLINE_CACHE_NAME = '2021-09-02 20:45:32 <%= serviceWorkerTime%>';
const isSWOpen = JSON.parse('<%= serviceWorker%>');

const emptyCacheUrl = [];
const onlineCacheUrl = [
    '/',

    '/favicon.png',
    '/libs/angular-material.min.css',
    '/libs/bundle.js',
    '/libs/lib.js',
    '/libs/MaterialIcons-Regular.eot',
    '/libs/MaterialIcons-Regular.ttf',
    '/libs/MaterialIcons-Regular.woff',
    '/libs/MaterialIcons-Regular.woff2',

    '/libs/facebook-brands.svg',
    '/libs/github-brands.svg',
    '/libs/google-brands.svg',
    '/libs/twitter-brands.svg',

    '/libs/style.css',

    '/public/views/skin/bing.html',
    '/public/views/skin/default.html',
    '/public/views/skin/fs_bing.html',

    '/public/views/home/facebook.html',
    '/public/views/home/github.html',
    '/public/views/home/google.html',
    '/public/views/home/home.html',
    '/public/views/home/index.html',
    '/public/views/home/login.html',
    '/public/views/home/macLogin.html',
    '/public/views/home/ref.html',
    '/public/views/home/refInput.html',
    '/public/views/home/resetPassword.html',
    '/public/views/home/signup.html',
    '/public/views/home/social.html',
    '/public/views/home/telegramLogin.html',
    '/public/views/home/twitter.html',

    '/public/views/user/account.html',
    '/public/views/user/changePassword.html',
    '/public/views/user/index.html',
    '/public/views/user/macAddress.html',
    '/public/views/user/notice.html',
    '/public/views/user/order.html',
    '/public/views/user/qrcodeDialog.html',
    '/public/views/user/ref.html',
    '/public/views/user/settings.html',
    '/public/views/user/telegram.html',
    '/public/views/user/user.html',

    '/public/views/app/app.html',
    '/public/views/app/index.html',
    '/public/views/app/loading.html',
    '/public/views/app/login.html',

    '/public/views/admin/account.html',
    '/public/views/admin/accountPage.html',
    '/public/views/admin/accountSetting.html',
    '/public/views/admin/accountSortAndFilterDialog.html',
    '/public/views/admin/addAccount.html',
    '/public/views/admin/addGroup.html',
    '/public/views/admin/addServer.html',
    '/public/views/admin/addUser.html',
    '/public/views/admin/admin.html',
    '/public/views/admin/baseSetting.html',
    '/public/views/admin/changePassword.html',
    '/public/views/admin/editAccount.html',
    '/public/views/admin/editGroup.html',
    '/public/views/admin/editNotice.html',
    '/public/views/admin/editOrder.html',
    '/public/views/admin/editPayment.html',
    '/public/views/admin/editServer.html',
    '/public/views/admin/giftcardBatchDetails.html',
    '/public/views/admin/giftcardBatchList.html',
    '/public/views/admin/groupList.html',
    '/public/views/admin/index.html',
    '/public/views/admin/mailSetting.html',
    '/public/views/admin/newNotice.html',
    '/public/views/admin/newOrder.html',
    '/public/views/admin/notice.html',
    '/public/views/admin/orderFilterDialog.html',
    '/public/views/admin/pay.html',
    '/public/views/admin/paymentList.html',
    '/public/views/admin/paymentSetting.html',
    '/public/views/admin/pickAccount.html',
    '/public/views/admin/pickTime.html',
    '/public/views/admin/previewNotice.html',
    '/public/views/admin/recentLogin.html',
    '/public/views/admin/recentSignup.html',
    '/public/views/admin/refCodeList.html',
    '/public/views/admin/refSetting.html',
    '/public/views/admin/refUserList.html',
    '/public/views/admin/server.html',
    '/public/views/admin/serverPage.html',
    '/public/views/admin/setExpireTime.html',
    '/public/views/admin/settings.html',
    '/public/views/admin/telegramSetting.html',
    '/public/views/admin/topFlow.html',
    '/public/views/admin/unfinished.html',
    '/public/views/admin/user.html',
    '/public/views/admin/userPage.html',
    '/public/views/admin/userSortDialog.html',

    '/public/views/dialog/addAccount.html',
    '/public/views/dialog/addGiftCardBatch.html',
    '/public/views/dialog/addMacAccount.html',
    '/public/views/dialog/alert.html',
    '/public/views/dialog/autopop.html',
    '/public/views/dialog/ban.html',
    '/public/views/dialog/changePassword.html',
    '/public/views/dialog/confirm.html',
    '/public/views/dialog/editUserComment.html',
    '/public/views/dialog/email.html',
    '/public/views/dialog/ip.html',
    '/public/views/dialog/language.html',
    '/public/views/dialog/order.html',
    '/public/views/dialog/pay.html',
    '/public/views/dialog/payByGiftCard.html',
    '/public/views/dialog/serverChart.html',
    '/public/views/dialog/setAccountServer.html',
    '/public/views/dialog/setCurrentAccount.html',
    '/public/views/dialog/setEmail.html',
    '/public/views/dialog/setUserGroup.html',
    '/public/views/dialog/showWireGuardConfig.html',
    '/public/views/dialog/subscribe.html',
];

self.addEventListener('activate', function (event) {
    const cacheWhitelist = [ONLINE_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('delete ' + key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(ONLINE_CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(isSWOpen ? onlineCacheUrl : emptyCacheUrl);
            })
    );
});

self.addEventListener('fetch', event => {
    const isMatch = () => {
        return (
            event.request.url.match(self.registration.scope + 'user/') ||
            event.request.url.match(self.registration.scope + 'home/') ||
            event.request.url.match(self.registration.scope + 'admin/')
        );
    };
    const isRoot = () => {
        return (event.request.url === self.registration.scope);
    };
    if (isMatch()) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(err => caches.match(new Request('/')))
                .then(response => response)
        );
    } else if (isRoot()) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(err => caches.match(event.request))
                .then(response => response)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response ? response : fetch(event.request);
                })
        );
    }
});

self.addEventListener('push', function (event) {
    // if (!(self.Notification && self.notification.permission === 'granted')) {
    //   return;
    // }
    const data = event.data.json();
    const title = data.title;
    event.waitUntil(
        self.registration.showNotification(title, {
            body: data.options.body,
            icon: '/favicon.png',
        }));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(self.registration.scope)
    );
});
