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

app.filter('order', function () {
    return function (status) {
        const result = {
            CREATE: '创建',
            WAIT_BUYER_PAY: '等待',
            TRADE_SUCCESS: '付款',
            FINISH: '完成',
            USED: '完成',
            TRADE_CLOSED: '关闭',
            created: '创建',
            approved: '付款',
            finish: '完成',
            closed: '关闭',
        };
        return result[status] || '其它';
    };
})
    .filter('prettyOrderId', function () {
        return function (id) {
            return `${id.substr(0, 4)}-${id.substr(4, 2)}-${id.substr(6, 2)} ${id.substr(8, 2)}:${id.substr(10, 2)}:${id.substr(12, 2)} ${id.substr(14)}`;
        };
    }).filter('prettyOrderType', function () {
    // TODO: 将此处的类型和其他地方的类型代码全部集中到一处
    return function (type) {
        const cardType = {
            5: '小时',
            4: '日',
            2: '周',
            3: '月',
            6: '季度',
            7: '年',
            8: '两周',
            9: '半年',
        };
        return cardType[type];
    };
});
