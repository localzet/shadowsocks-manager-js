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
const isNotUserOrAdmin = appRequire('plugins/webgui_telegram/index').isNotUserOrAdmin;
const telegram = appRequire('plugins/webgui_telegram/index').telegram;
const getMe = appRequire('plugins/webgui_telegram/index').getMe;
const knex = appRequire('init/knex').knex;
const user = appRequire('plugins/user/index');
const emailPlugin = appRequire('plugins/email/index');
const account = appRequire('plugins/account/index');
const redis = appRequire('init/redis').redis;

const isUserBindMessage = message => {
  if(!message.message || !message.message.text) { return false; }
  if(!message.message || !message.message.chat || !message.message.chat.type === 'private') { return false; }
  if(!message.message.text.trim().match(/^\d{8}$/)) { return false; }
  return true;
};

telegram.on('message', async message => {
  if(isUserBindMessage(message)) {
    let isFailed = true;
    const telegramId = message.message.chat.id.toString();
    const failNumber = await redis.get(`Temp:TelegramFail:${ telegramId }`);
    if(+failNumber >= 10) {
      console.log(`telegram id[${telegramId}] is blocked in 10 mins`);
      return;
    }
    const keys = await redis.keys('Temp:TelegramBind:*');
    for(const key of keys) {
      const code =  await redis.get(key);
      if(code === message.message.text.trim()) {
        isFailed = false;
        const userId = key.split(':')[2];
        bindUser(userId, message);
      }
    }
    if(isFailed) {
      const failNumber = await redis.incr(`Temp:TelegramFail:${ telegramId }`);
      if(+failNumber === 1) {
        await redis.expire(`Temp:TelegramFail:${ telegramId }`, 120);
      }
    }
  }
});

const bindUser = async (userId, message) => {
  const telegramId = message.message.chat.id.toString();
  if(!telegramId) {
    return Promise.reject('');
  }
  const exists = await knex('user').where({
    telegram: telegramId
  }).then(success => success[0]);
  if(exists) {
    return Promise.reject('');
  }
  await user.edit({ id: userId }, { telegram: telegramId });
  // telegram.emit('reply', message, 'Telegram账号绑定成功，输入 help 查看使用方法');
  tg.sendMessage('Telegram账号绑定成功，输入 help 查看使用方法', telegramId);
};

const unbindUser = async (userId) => {
  const exists = await knex('user').where({
    id: userId
  }).then(success => success[0]);
  if(!exists) {
    return Promise.reject('');
  }
  if(!exists.telegram) {
    return Promise.reject('');
  }
  await user.edit({ id: userId }, { telegram: null });
  // telegram.emit('send', +exists.telegram, 'Telegram账号已经解除绑定');
  tg.sendMessage('Telegram账号已经解除绑定', +exists.telegram);
};

exports.getCode = async (userId) => {
  const exists = await knex('user').where({
    id: userId
  }).then(success => success[0]);
  if(exists && exists.telegram) {
    return {
      user: exists.telegram,
    };
  }
  const botInfo = await getMe();
  let code = await redis.get(`Temp:TelegramBind:${userId}`);
  if(code) {
    return {
      code,
      telegram: botInfo.result.username,
    };
  } else {
    code = Math.random().toString().substr(2, 8);
    await redis.set(`Temp:TelegramBind:${userId}`, code, 'EX', 120);
    return {
      code,
      telegram: botInfo.result.username,
    };
  }
};

exports.unbindUser = unbindUser;


// 用户注册功能
const isEmail = message => {
  if(!message.message || !message.message.text) { return false; }
  if(!message.message || !message.message.chat || !message.message.chat.type === 'private') { return false; }
  if(!message.message.text.trim().match(/^[\w.\-]+@(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z]{2,3}$/)) { return false; }
  return true;
};

const isSignupCodeMessage = message => {
  if(!message.message || !message.message.text) { return false; }
  if(!message.message || !message.message.chat || !message.message.chat.type === 'private') { return false; }
  if(!message.message.text.trim().match(/^\d{6}$/)) { return false; }
  return true;
};

telegram.on('message', async message => {
  try {
    if(isEmail(message)) {
      const telegramId = message.message.chat.id.toString();
      await isNotUserOrAdmin(telegramId);
      const setting = await knex('webguiSetting').select().where({
        key: 'account',
      }).then(success => JSON.parse(success[0].value));
      if(!setting.signUp.isEnable) {
        return Promise.reject();
      }
      const mailSetting = await knex('webguiSetting').select().where({
        key: 'mail',
      }).then(success => JSON.parse(success[0].value)).then(s => s.code);
      const email = message.message.text;
      const isUserExists = await knex('user').where({ email }).then(s => s[0]);
      if(isUserExists) { return; }
      await emailPlugin.sendCode(email, mailSetting.title || 'ss验证码', mailSetting.content || '欢迎新用户注册，\n您的验证码是：', {
        telegramId
      });
      await tg.sendMessage(`验证码已经发送至[ ${email} ]，输入验证码即可完成注册`, telegramId);
    } else if(isSignupCodeMessage(message)) {
      const telegramId = message.message.chat.id.toString();
      await isNotUserOrAdmin(telegramId);
      const code = message.message.text.trim();
      const emailInfo = await emailPlugin.checkCodeFromTelegram(telegramId, code);
      const userId = (await user.add({
        username: emailInfo.to,
        email: emailInfo.to,
        password: Math.random().toString().substr(2),
        type: 'normal',
        telegramId,
      }))[0];
      const setting = await knex('webguiSetting').select().where({
        key: 'account',
      }).then(success => JSON.parse(success[0].value));
      const newUserAccount = setting.accountForNewUser;
      if(!setting.accountForNewUser.isEnable) {
        return;
      }
      const getNewPort = async () => {
        const setting = await knex('webguiSetting').select().where({
          key: 'account',
        }).then(success => JSON.parse(success[0].value));
        const port = setting.port;
        if(port.random) {
          const getRandomPort = () => Math.floor(Math.random() * (port.end - port.start + 1) + port.start);
          let retry = 0;
          let myPort = getRandomPort();
          const checkIfPortExists = port => {
            let myPort = port;
            return knex('account_plugin').select()
            .where({ port }).then(success => {
              if(success.length && retry <= 30) {
                retry++;
                myPort = getRandomPort();
                return checkIfPortExists(myPort);
              } else if (success.length && retry > 30) {
                return Promise.reject('Can not get a random port');
              } else {
                return myPort;
              }
            });
          };
          return checkIfPortExists(myPort);
        } else {
          return knex('account_plugin').select()
          .whereBetween('port', [port.start, port.end])
          .orderBy('port', 'DESC').limit(1).then(success => {
            if(success.length) {
              return success[0].port + 1;
            }
            return port.start;
          });
        }
      };
      const port = await getNewPort();
      await account.addAccount(newUserAccount.type || 5, {
        user: userId,
        port,
        password: Math.random().toString().substr(2,10),
        time: Date.now(),
        limit: newUserAccount.limit || 8,
        flow: (newUserAccount.flow ? newUserAccount.flow : 350) * 1000000,
        server: newUserAccount.server ? JSON.stringify(newUserAccount.server): null,
        autoRemove: newUserAccount.autoRemove ? 1 : 0,
        multiServerFlow: newUserAccount.multiServerFlow ? 1 : 0,
      });
      await tg.sendMessage(`用户[ ${ emailInfo.to } ]注册完成，输入 help 查看具体指令`, telegramId);
    }
  } catch(err) {
    console.log(err);
  }
});
