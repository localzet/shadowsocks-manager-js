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

const telegram = appRequire('plugins/telegram/index').telegram;
const managerAddress = appRequire('plugins/telegram/managerAddress');
const serverManager = appRequire('plugins/telegram/serverManager');

const log4js = require('log4js');
const logger = log4js.getLogger('telegram');

const list = (message) => {
  serverManager.list().then(servers => {
    let str = '';
    servers.forEach(server => {
      str += `[${server.id}]${server.name}, ${server.host}:${server.port} ${server.password}\n`;
    });
    telegram.emit('send', message, str);
  }).catch(err => {
    logger.error(err);
  });
};

const add = (message, name, host, port, password) => {
  serverManager.add(name, host, port, password)
  .then(success => {
    telegram.emit('send', message, `Add server ${name} success.`);
  })
  .catch(err => {
    logger.error(err);
  });
};

const edit = (message, id, name, host, port, password) => {
  serverManager.edit({id, name, host, port, password})
  .then(success => {
    telegram.emit('send', message, `Edit server ${name} success.`);
  })
  .catch(err => {
    logger.error(err);
  });
};

const del = (message, id) => {
  serverManager.del(id)
  .then(success => {
    telegram.emit('send', message, `Delete server ${id} success.`);
  })
  .catch(err => {
    logger.error(err);
  });
};

const switchServer = (message, id) => {
  serverManager.list().then(servers => {
    const server = servers.filter(f => {
      return f.id === +id;
    })[0];
    if(!server) {
      return;
    }
    managerAddress.set(server.host, server.port, server.password);
    telegram.emit('send', message, `Switch to server ${id}.`);
  }).catch(err => {
    logger.error(err);
  });
};

telegram.on('manager', message => {

  const addReg = new RegExp(/^addserver ([\w\.]{0,}) ([\w\.]{0,}) (\d{0,5}) ([\w]{0,})$/);
  const editReg = new RegExp(/^editserver ([\w\.]{0,}) ([\w\.]{0,}) ([\w\.]{0,}) (\d{0,5}) ([\w]{0,})$/);
  const delReg = new RegExp(/^delserver ([\w\.]{0,})$/);
  const switchReg = new RegExp(/^switchserver ([\w\.]{0,})$/);

  if(message.message.text === 'listserver') {
    list(message);
  } else if(message.message.text.match(addReg)) {
    const reg = message.message.text.match(addReg);
    const name = reg[1];
    const host = reg[2];
    const port = +reg[3];
    const password = reg[4];
    add(message, name, host, port, password);
  } else if(message.message.text.match(editReg)) {
    const reg = message.message.text.match(editReg);
    const id = reg[1];
    const name = reg[2];
    const host = reg[3];
    const port = +reg[4];
    const password = reg[5];
    edit(message, id, name, host, port, password);
  } else if(message.message.text.match(delReg)) {
    const reg = message.message.text.match(delReg);
    const id = reg[1];
    del(message, id);
  } else if(message.message.text.match(switchReg)) {
    const reg = message.message.text.match(switchReg);
    const id = reg[1];
    switchServer(message, id);
  }
});
