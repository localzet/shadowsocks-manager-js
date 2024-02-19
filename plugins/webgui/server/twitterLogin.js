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

const crypto = require('crypto');
const get = require('simple-get');
const OAuth = require('oauth-1.0a');
const querystring = require('querystring');

const TW_REQ_TOKEN_URL = 'https://api.twitter.com/oauth/request_token';
const TW_AUTH_URL = 'https://api.twitter.com/oauth/authenticate';
const TW_ACCESS_TOKEN_URL = 'https://api.twitter.com/oauth/access_token';

class LoginWithTwitter {
  constructor (opts) {

    if (!opts.consumerKey || typeof opts.consumerKey !== 'string') {
      throw new Error('Invalid or missing `consumerKey` option');
    }
    if (!opts.consumerSecret || typeof opts.consumerSecret !== 'string') {
      throw new Error('Invalid or missing `consumerSecret` option');
    }
    if (!opts.callbackUrl || typeof opts.callbackUrl !== 'string') {
      throw new Error('Invalid or missing `callbackUrl` option');
    }

    this.consumerKey = opts.consumerKey;
    this.consumerSecret = opts.consumerSecret;
    this.callbackUrl = opts.callbackUrl;

    this._oauth = OAuth({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) => {
        return crypto.createHmac('sha1', key).update(baseString).digest('base64')
      }
    });
  }

  login () {
    return new Promise((resolve, reject) => {
      const requestData = {
        url: TW_REQ_TOKEN_URL,
        method: 'POST',
        data: {
          oauth_callback: this.callbackUrl
        }
      };

      get.concat({
        url: requestData.url,
        method: requestData.method,
        form: requestData.data,
        headers: this._oauth.toHeader(this._oauth.authorize(requestData))
      }, (err, res, data) => {
        if (err) return reject(err);

        const {
          oauth_token: token,
          oauth_token_secret: tokenSecret,
          oauth_callback_confirmed: callbackConfirmed
        } = querystring.parse(data.toString());

        if (callbackConfirmed !== 'true') {
          return reject(new Error('Missing `oauth_callback_confirmed` parameter in response'));
        }

        const url = `${TW_AUTH_URL}?${querystring.stringify({ oauth_token: token })}`;

        resolve({ tokenSecret, url });
      });
    });
  }

  callback (params, tokenSecret) {
    return new Promise((resolve, reject) => {
      const {
        oauth_token: token,
        oauth_verifier: verifier
      } = params;

      if (typeof params.denied === 'string' && params.denied.length > 0) {
        const err = new Error('User denied login permission');
        err.code = 'USER_DENIED';
        return reject(err);
      }
      if (typeof params.oauth_token !== 'string' || params.oauth_token.length === 0) {
        return reject(new Error('Invalid or missing `oauth_token` parameter for login callback'));
      }
      if (typeof params.oauth_verifier !== 'string' || params.oauth_verifier.length === 0) {
        return reject(new Error('Invalid or missing `oauth_verifier` parameter for login callback'));
      }
      if (typeof tokenSecret !== 'string' || tokenSecret.length === 0) {
        return reject(new Error('Invalid or missing `tokenSecret` argument for login callback'));
      }

      const requestData = {
        url: TW_ACCESS_TOKEN_URL,
        method: 'POST',
        data: {
          oauth_token: token,
          oauth_token_secret: tokenSecret,
          oauth_verifier: verifier
        }
      };

      get.concat({
        url: requestData.url,
        method: requestData.method,
        form: requestData.data,
        headers: this._oauth.toHeader(this._oauth.authorize(requestData))
      }, (err, res, data) => {
        if (err) return reject(err);

        const {
          oauth_token: userToken,
          oauth_token_secret: userTokenSecret,
          screen_name: userName,
          user_id: userId
        } = querystring.parse(data.toString());

        resolve({
          userName,
          userId,
          userToken,
          userTokenSecret
        });
      });
    });
  }

  userInfo (params) {
    return new Promise((resolve, reject) => {
      const {
        userToken: token,
        userTokenSecret: secret,
      } = params;
      if (typeof params.denied === 'string' && params.denied.length > 0) {
        const err = new Error('User denied login permission');
        err.code = 'USER_DENIED';
        return reject(err);
      }
      if (typeof params.userToken !== 'string' || params.userToken.length === 0) {
        return reject(new Error('Invalid or missing `oauth_token` parameter for login callback'));
      }
      if (typeof params.userTokenSecret !== 'string' || params.userTokenSecret.length === 0) {
        return reject(new Error('Invalid or missing `oauth_verifier` parameter for login callback'));
      }

      const requestData = {
        url: 'https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true&include_email=true&include_entities=false',
        method: 'GET',
      };
      const tokenInfo = {
        key: token,
        secret,
      };
      const headers = this._oauth.toHeader(this._oauth.authorize(requestData, tokenInfo));
      get.concat({
        url: requestData.url,
        method: requestData.method,
        headers,
        json: true,
      }, (err, res, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

}

module.exports = LoginWithTwitter;
