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

const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
const knex = appRequire('init/knex').knex;
const config = appRequire('services/config').all();
if (config.plugins.webgui.gcmAPIKey && config.plugins.webgui.gcmSenderId) {
    webpush.setGCMAPIKey(config.plugins.webgui.gcmAPIKey);
    webpush.setVapidDetails(
        'mailto:xxx@ooo.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );

    exports.pushMessage = async (title, options) => {
        const users = await knex('push').select();
        const arr = [];
        users.filter(f => f.userId === 1).forEach(user => {
            const promise = webpush.sendNotification({
                endpoint: user.endpoint,
                keys: {
                    auth: user.auth,
                    p256dh: user.p256dh,
                }
            }, JSON.stringify({title, options})).catch(() => {
                return knex('push').delete().where({endpoint: user.endpoint});
            });
            arr.push(promise);
        });
        await Promise.all(arr);
        return;
    };

    const insertPushList = async (userId, data) => {
        const push = await knex('push').select().where({
            endpoint: data.endpoint,
        }).then(success => success[0]);
        if (push) {
            await knex('push').update({
                userId,
                auth: data.keys.auth,
                p256dh: data.keys.p256dh,
            }).where({endpoint: data.endpoint});
        } else {
            await knex('push').insert({
                userId,
                endpoint: data.endpoint,
                auth: data.keys.auth,
                p256dh: data.keys.p256dh,
            });
        }
        return;
    };

    exports.client = (req, res) => {
        const data = req.body.data;
        if (!req.session.type || req.session.type === 'normal') {
            return knex('push').delete().where({endpoint: data.endpoint})
                .then(() => {
                    res.send('success');
                });
        }
        const userId = req.session.user;
        insertPushList(userId, data).then(success => {
            res.send('success');
        }).catch(err => {
            console.log(err);
            res.status(403).end();
        });
    };
    exports.deleteClient = (req, res) => {
        if (!req.query.data) {
            return res.send('success');
        }
        const data = JSON.parse(req.query.data);
        return knex('push').delete().where({endpoint: data.endpoint})
            .then(() => {
                res.send('success');
            })
            .catch(err => {
                console.log(err);
                res.status(403).end();
            });
    };

} else {

    exports.pushMessage = () => Promise.resolve();
    exports.client = () => {
    };
}
