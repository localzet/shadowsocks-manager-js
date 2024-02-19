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

const knex = appRequire('init/knex').knex;

exports.getNotice = async (req, res) => {
    try {
        const noticesWithoutGroup = await knex('notice').where({group: 0});
        const noticesWithGroup = await knex('notice').select([
            'notice.id as id',
            'notice.title as title',
            'notice.content as content',
            'notice.time as time',
            'notice.group as group',
            'notice.autopop as autopop',
            knex.raw('GROUP_CONCAT(notice_group.groupId) as groupIds'),
        ])
            .innerJoin('notice_group', 'notice.id', 'notice_group.noticeId')
            .where('notice.group', '>', 0)
            .groupBy('notice.id');
        const notices = [...noticesWithoutGroup, ...noticesWithGroup].map(m => {
            if (m.group) {
                m.groupIds = m.groupIds.split(',').map(m => +m);
            }
            return m;
        }).sort((a, b) => b.time - a.time);
        return res.send(notices);
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.getOneNotice = async (req, res) => {
    try {
        const id = req.params.noticeId;
        const noticeInfo = await knex('notice').where({
            id,
        }).then(success => success[0]);
        if (!noticeInfo) {
            return Promise.reject(new Error('notice not found'));
        }
        if (noticeInfo.group) {
            const groups = await knex('notice_group').where({
                noticeId: noticeInfo.id,
            }).then(success => success.map(m => m.groupId));
            noticeInfo.groups = groups;
        }
        res.send(noticeInfo);
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.addNotice = async (req, res) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        const group = +req.body.group;
        const groups = req.body.groups;
        const autopop = req.body.autopop;
        const [id] = await knex('notice').insert({
            title,
            content,
            time: Date.now(),
            group,
            autopop,
        });
        if (group && groups.length) {
            await knex('notice_group').insert(groups.map(groupId => {
                return {
                    noticeId: id,
                    groupId,
                };
            }));
        }
        res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.editNotice = async (req, res) => {
    try {
        const id = req.params.noticeId;
        const title = req.body.title;
        const content = req.body.content;
        const group = +req.body.group;
        const groups = req.body.groups;
        const autopop = req.body.autopop;
        await knex('notice').update({
            title,
            content,
            time: Date.now(),
            group,
            autopop
        }).where({
            id,
        });
        if (group) {
            const currentGroups = await knex('notice_group').where({
                noticeId: id,
            }).then(success => success.map(m => m.groupId));
            for (const groupId of currentGroups) {
                if (!groups.includes(groupId)) {
                    await knex('notice_group').delete().where({
                        noticeId: id,
                        groupId,
                    });
                }
            }
            for (const groupId of groups) {
                if (!currentGroups.includes(groupId)) {
                    await knex('notice_group').insert({
                        noticeId: id,
                        groupId,
                    });
                }
            }
        }
        return res.send('success');
    } catch (err) {
        console.log(err);
        res.status(403).end();
    }
};

exports.deleteNotice = (req, res) => {
    const id = req.params.noticeId;
    knex('notice').delete().where({
        id,
    }).then(success => {
        return res.send('success');
    }).catch(err => {
        console.log(err);
        res.status(403).end();
    });
};
