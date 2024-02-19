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

const getRefCode = async () => {
    const code = await knex('webgui_ref_code').select([
        'webgui_ref_code.code as code',
        'user.email as email',
        'webgui_ref_code.maxUser as maxUser',
        knex.raw('count(webgui_ref.codeId) as count'),
    ])
        .leftJoin('webgui_ref', 'webgui_ref_code.id', 'webgui_ref.codeId')
        .leftJoin('user', 'webgui_ref_code.sourceUserId', 'user.id')
        .groupBy('webgui_ref_code.id')
        .orderBy('webgui_ref_code.time', 'DESC');
    return code;
};

const getRefCodeAndPaging = async opt => {
    const page = opt.page || 1;
    const pageSize = opt.pageSize || 20;
    const search = opt.search;
    const invalidCode = await knex('webgui_ref_code').select([
        'webgui_ref_code.id as id',
    ])
        .leftJoin('user', 'webgui_ref_code.sourceUserId', 'user.id')
        .whereNull('user.id');
    await knex('webgui_ref_code').delete().whereIn('id', invalidCode.map(m => m.id));
    let count = knex('webgui_ref_code').select();
    let code = knex('webgui_ref_code').select([
        'webgui_ref_code.id as id',
        'webgui_ref_code.code as code',
        'user.email as email',
        'webgui_ref_code.visit as visit',
        'webgui_ref_code.maxUser as maxUser',
        knex.raw('count(webgui_ref.codeId) as count'),
    ])
        .leftJoin('webgui_ref', 'webgui_ref_code.id', 'webgui_ref.codeId')
        .leftJoin('user', 'webgui_ref_code.sourceUserId', 'user.id')
        .whereNotNull('user.id')
        .groupBy('webgui_ref_code.id');

    if (search) {
        count = count.where('webgui_ref_code.code', 'like', `%${search}%`);
        code = code.where('webgui_ref_code.code', 'like', `%${search}%`);
    }

    count = await count.count('id as count').then(success => success[0].count);
    code = await code.orderBy('webgui_ref_code.time', 'DESC').limit(pageSize).offset((page - 1) * pageSize);
    const maxPage = Math.ceil(count / pageSize);
    return {
        total: count,
        page,
        maxPage,
        pageSize,
        code,
    };
};

const getRefUser = async () => {
    const user = await knex('webgui_ref').select([
        'webgui_ref_code.code as code',
        'u1.email as sourceUser',
        'u2.email as user',
        'webgui_ref.time as time',
    ]).leftJoin('webgui_ref_code', 'webgui_ref.codeId', 'webgui_ref_code.id')
        .leftJoin('user as u1', 'webgui_ref_code.sourceUserId', 'u1.id')
        .leftJoin('user as u2', 'webgui_ref.userId', 'u2.id')
        .orderBy('webgui_ref.time', 'DESC');
    return user;
};

const getRefUserAndPaging = async opt => {
    const page = opt.page || 1;
    const pageSize = opt.pageSize || 20;
    const invalidId = await knex('webgui_ref').select([
        'webgui_ref.id as id',
    ])
        .leftJoin('webgui_ref_code', 'webgui_ref.codeId', 'webgui_ref_code.id')
        .leftJoin('user as u1', 'webgui_ref_code.sourceUserId', 'u1.id')
        .leftJoin('user as u2', 'webgui_ref.userId', 'u2.id')
        .whereNull('u1.id')
        .orWhereNull('u2.id');
    await knex('webgui_ref').delete().whereIn('id', invalidId.map(m => m.id));
    let count = knex('webgui_ref').select();
    let user = knex('webgui_ref').select([
        'webgui_ref.id as id',
        'webgui_ref_code.code as code',
        'u1.id as sourceUserId',
        'u1.email as sourceUser',
        'u2.id as userId',
        'u2.email as user',
        'webgui_ref.time as time',
    ])
        .leftJoin('webgui_ref_code', 'webgui_ref.codeId', 'webgui_ref_code.id')
        .leftJoin('user as u1', 'webgui_ref_code.sourceUserId', 'u1.id')
        .leftJoin('user as u2', 'webgui_ref.userId', 'u2.id')
        .whereNotNull('u1.id')
        .whereNotNull('u2.id');

    count = await count.count('id as count').then(success => success[0].count);
    user = await user.orderBy('webgui_ref.time', 'DESC').limit(pageSize).offset((page - 1) * pageSize);
    const maxPage = Math.ceil(count / pageSize);
    return {
        total: count,
        page,
        maxPage,
        pageSize,
        user,
    };
};

const getOneRefCode = async id => {
    const code = await knex('webgui_ref_code').select([
        'webgui_ref_code.id as id',
        'webgui_ref_code.code as code',
        'user.email as email',
        'webgui_ref_code.visit as visit',
        'webgui_ref_code.maxUser as maxUser',
        knex.raw('count(webgui_ref.codeId) as count'),
    ])
        .leftJoin('webgui_ref', 'webgui_ref_code.id', 'webgui_ref.codeId')
        .leftJoin('user', 'webgui_ref_code.sourceUserId', 'user.id')
        .groupBy('webgui_ref_code.id')
        .where({'webgui_ref_code.id': id}).then(s => s[0]);
    if (!code) {
        return Promise.reject('refCode not found');
    }
    return code;
};

const editOneRefCode = async (id, maxUser) => {
    await knex('webgui_ref_code').update({maxUser}).where({'webgui_ref_code.id': id});
    return 'success';
};

exports.getRefCode = getRefCode;
exports.getOneRefCode = getOneRefCode;
exports.editOneRefCode = editOneRefCode;
exports.getRefUser = getRefUser;
exports.getRefCodeAndPaging = getRefCodeAndPaging;
exports.getRefUserAndPaging = getRefUserAndPaging;
