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

const addRefCode = async (userId, max = 3) => {
    const code = Math.random().toString().substr(2, 10);
    await knex('webgui_ref_code').insert({
        code,
        sourceUserId: userId,
        maxUser: max,
        time: Date.now(),
    });
};

const getRefSetting = async () => {
    const setting = await knex('webguiSetting').select().where({
        key: 'webgui_ref',
    }).then(success => {
        if (!success.length) {
            return Promise.reject('settings not found');
        }
        success[0].value = JSON.parse(success[0].value);
        return success[0].value;
    });
    return setting;
};

const getRefCode = async userId => {
    const setting = await getRefSetting();
    const exists = await knex('webgui_ref_code').where({sourceUserId: userId});
    if (exists.length < setting.refNumber) {
        for (let i = 0; i < setting.refNumber - exists.length; i++) {
            await addRefCode(userId, setting.refUserNumber);
        }
    }
    const code = await knex('webgui_ref_code').select([
        'webgui_ref_code.code as code',
        'webgui_ref_code.maxUser as maxUser',
        knex.raw('count(webgui_ref.codeId) as count'),
    ]).where({sourceUserId: userId})
        .leftJoin('webgui_ref', 'webgui_ref_code.id', 'webgui_ref.codeId')
        .groupBy('webgui_ref_code.id');
    return code;
};

const getRefUser = async userId => {
    const user = await knex('webgui_ref').select([
        'webgui_ref_code.code as code',
        'user.id as id',
        'user.email as email',
        'webgui_ref.time as time',
    ])
        .where({'webgui_ref_code.sourceUserId': userId})
        .leftJoin('webgui_ref_code', 'webgui_ref.codeId', 'webgui_ref_code.id')
        .leftJoin('user', 'webgui_ref.userId', 'user.id')
        .orderBy('webgui_ref.time', 'DESC');
    return user;
};

const getRefSourceUser = async userId => {
    const user = await knex('webgui_ref_code').select([
        'user.id as id',
        'user.email as email',
    ])
        .where({'webgui_ref.userId': userId})
        .leftJoin('webgui_ref', 'webgui_ref.codeId', 'webgui_ref_code.id')
        .leftJoin('user', 'webgui_ref_code.sourceUserId', 'user.id');
    return user[0];
};

const setRefForUser = async (sourceUserId, refUserId, code) => {
    if (sourceUserId === refUserId) {
        return Promise.reject('id can not be same');
    }
    const my = await knex('webgui_ref_code').select([
        'webgui_ref_code.id as id',
    ]).where({
        'webgui_ref_code.code': code,
        'webgui_ref_code.sourceUserId': sourceUserId,
    }).then(s => s[0]);
    await knex('webgui_ref').insert({
        codeId: my.id,
        userId: refUserId,
        time: Date.now(),
    });
};

const deleteRefCode = async code => {
    const codeInfo = await knex('webgui_ref_code').where({code}).then(s => s[0]);
    await knex('webgui_ref_code').delete().where({id: codeInfo.id});
    await knex('webgui_ref').delete().where({codeId: codeInfo.id});
};

const deleteRefUser = async (sourceUserId, refUserId) => {
    const refInfo = await knex('webgui_ref').select([
        'webgui_ref.id as id',
    ])
        .leftJoin('webgui_ref_code', 'webgui_ref_code.id', 'webgui_ref.codeId')
        .where({
            'webgui_ref_code.sourceUserId': sourceUserId,
            'webgui_ref.userId': refUserId,
        }).then(s => s[0]);
    await knex('webgui_ref').delete().where({id: refInfo.id});
};

exports.setRefForUser = setRefForUser;
exports.addRefCode = addRefCode;
exports.getRefCode = getRefCode;
exports.getRefUser = getRefUser;
exports.getRefSourceUser = getRefSourceUser;
exports.deleteRefCode = deleteRefCode;
exports.deleteRefUser = deleteRefUser;
