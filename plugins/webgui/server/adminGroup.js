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

const group = appRequire('plugins/group/index');
const knex = appRequire('init/knex').knex;

exports.getGroups = (req, res, next) => {
    group.getGroupsAndUserNumber().then(success => {
        res.send(success);
    }).catch(err => {
        console.log(err);
        res.status(403).end();
    });
};

exports.getOneGroup = (req, res, next) => {
    const id = +req.params.id;
    group.getOneGroup(id).then(success => {
        res.send(success);
    }).catch(err => {
        console.log(err);
        res.status(403).end();
    });
};

exports.addGroup = async (req, res) => {
    try {
        const name = req.body.name;
        const comment = req.body.comment;
        const order = req.body.order ? JSON.stringify(req.body.order) : null;
        const multiAccount = !!req.body.multiAccount;
        const notices = req.body.notices;
        const [id] = await group.addGroup(name, comment, order, multiAccount);
        const ids = await knex('notice').where({group: 1}).then(success => success.map(m => m.id));
        for (const noticeId of notices) {
            if (ids.includes(noticeId)) {
                await knex('notice_group').insert({
                    groupId: id,
                    noticeId,
                });
            }
        }
        res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.editGroup = async (req, res) => {
    try {
        const id = +req.params.id;
        const name = req.body.name;
        const comment = req.body.comment;
        const order = req.body.order ? JSON.stringify(req.body.order) : null;
        const multiAccount = !!req.body.multiAccount;
        const notices = req.body.notices;
        await group.editGroup(id, name, comment, order, multiAccount);
        const ids = await knex('notice').where({group: 1}).then(success => success.map(m => m.id));
        const currentIds = await knex('notice_group').where({
            groupId: id,
        }).then(success => success.map(m => m.noticeId));
        for (const noticeId of notices) {
            if (!currentIds.includes(noticeId) && ids.includes(noticeId)) {
                await knex('notice_group').insert({
                    groupId: id,
                    noticeId,
                });
            }
        }
        for (noticeId of currentIds) {
            if (!notices.includes(noticeId)) {
                await knex('notice_group').delete().where({
                    groupId: id,
                    noticeId,
                });
            }
        }

        res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.deleteGroup = (req, res, next) => {
    const id = +req.params.id;
    group.deleteGroup(id).then(success => {
        res.send('success');
    }).catch(err => {
        console.log(err);
        res.status(403).end();
    });
};

exports.setUserGroup = (req, res, next) => {
    const groupId = +req.params.groupId;
    const userId = +req.params.userId;
    group.setUserGroup(groupId, userId).then(success => {
        res.send('success');
    }).catch(err => {
        console.log(err);
        res.status(403).end();
    });
};
