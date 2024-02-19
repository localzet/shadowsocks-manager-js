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

const app = angular.module('app');
const window = require('window');
const cdn = window.cdn || '';

app.config(['$stateProvider', $stateProvider => {
  $stateProvider
    .state('home', {
      url: '/home',
      abstract: true,
      templateUrl: `${ cdn }/public/views/home/home.html`,
      resolve: {
        myConfig: ['$http', 'configManager', ($http, configManager) => {
          if(configManager.getConfig().version) { return; }
          return $http.get('/api/home/login').then(success => {
            configManager.setConfig(success.data);
          });
        }]
      },
    })
    .state('home.index', {
      url: '/index',
      controller: 'HomeIndexController',
      templateUrl: `${ cdn }/public/views/home/index.html`,
    })
    .state('home.login', {
      url: '/login',
      controller: 'HomeLoginController',
      templateUrl: `${ cdn }/public/views/home/login.html`,
    })
    .state('home.macLogin', {
      url: '/login/:mac',
      controller: 'HomeMacLoginController',
      templateUrl: `${ cdn }/public/views/home/macLogin.html`,
    })
    .state('home.telegramLogin', {
      url: '/login/telegram/:token',
      controller: 'HomeTelegramLoginController',
      templateUrl: `${ cdn }/public/views/home/telegramLogin.html`,
    })
    .state('home.signup', {
      url: '/signup',
      controller: 'HomeSignupController',
      templateUrl: `${ cdn }/public/views/home/signup.html`,
    })
    .state('home.resetPassword', {
      url: '/password/reset/:token',
      controller: 'HomeResetPasswordController',
      templateUrl: `${ cdn }/public/views/home/resetPassword.html`,
    })
    .state('home.refInput', {
      url: '/ref',
      controller: 'HomeRefInputController',
      templateUrl: `${ cdn }/public/views/home/refInput.html`,
    })
    .state('home.ref', {
      url: '/ref/:refId',
      controller: 'HomeRefController',
      templateUrl: `${ cdn }/public/views/home/ref.html`,
    })
    .state('home.social', {
      url: '/social',
      controller: 'HomeSocialLoginController',
      templateUrl: `${ cdn }/public/views/home/social.html`,
    })
    .state('home.google', {
      url: '/google',
      controller: 'HomeGoogleLoginController',
      templateUrl: `${ cdn }/public/views/home/google.html`,
    })
    .state('home.facebook', {
      url: '/facebook',
      controller: 'HomeFacebookLoginController',
      templateUrl: `${ cdn }/public/views/home/facebook.html`,
    })
    .state('home.github', {
      url: '/github',
      controller: 'HomeGithubLoginController',
      templateUrl: `${ cdn }/public/views/home/github.html`,
    })
    .state('home.twitter', {
      url: '/twitter',
      controller: 'HomeTwitterLoginController',
      templateUrl: `${ cdn }/public/views/home/twitter.html`,
    })
    ;
  }
]);

