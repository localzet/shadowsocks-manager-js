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

const tg = appRequire('plugins/webgui_telegram/index');
const telegram = appRequire('plugins/webgui_telegram/index').telegram;
const isUser = appRequire('plugins/webgui_telegram/index').isUser;
const isNotUserOrAdmin = appRequire('plugins/webgui_telegram/index').isNotUserOrAdmin;
const config = appRequire('services/config').all();
const knex = appRequire('init/knex').knex;

const isHelp = message => {
  if(!message.message || !message.message.text) { return false; }
  if(!message.message || !message.message.chat || !message.message.chat.type === 'private') { return false; }
  if(message.message.text.trim() !== 'help' && message.message.text !== '/start') { return false; }
  return true;
};

telegram.on('message', async message => {
  if(!isHelp(message)) { return; }
  const telegramId = message.message.chat.id.toString();
  const userStatus = await tg.getUserStatus(telegramId);
  const title = (await knex('webguiSetting').select().where({
    key: 'base',
  }).then(success => {
    if (!success.length) { return Promise.reject('settings not found'); }
    success[0].value = JSON.parse(success[0].value);
    return success[0].value;
  })).title;
  const site = config.plugins.webgui.site;
  if(userStatus.status === 'empty') {
    tg.sendKeyboard(`欢迎使用 ${ title }，\n\n请在这里输入您的邮箱以接收验证码来注册账号\n\n或者点击以下按钮访问网页版`, telegramId, {
      inline_keyboard: [[{
        text: '登录网页版',
        url: site,
      }]],
    });
  } else if (userStatus.status === 'normal') {
    tg.sendMessage('指令列表：\n\naccount: 显示ss账号信息\nlogin: 快捷登录网页版', telegramId);
  }
});
