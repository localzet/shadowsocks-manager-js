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

let gcmSenderId = appRequire('services/config').get('plugins.webgui.gcmSenderId');
if(gcmSenderId) { gcmSenderId = gcmSenderId.toString(); }

const manifest = {
  short_name: 'ssmgr',
  name: 'Shadowsocks-Manager',
  icons: [
    {
      src: '/favicon.png',
      type: 'image/png',
      sizes: '48x48'
    },
    {
      src: '/favicon.png',
      type: 'image/png',
      sizes: '128x128'
    },
    {
      src: '/favicon.png',
      type: 'image/png',
      sizes: '144x144'
    },
    {
      src: '/favicon.png',
      type: 'image/png',
      sizes: '256x256'
    }
  ],
  start_url: '/',
  display: 'fullscreen',
  background_color: '#2196F3',
  theme_color: '#2196F3',
  gcm_sender_id: gcmSenderId,
};

exports.manifest = manifest;
