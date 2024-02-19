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

app.filter('flow', function() {
  const K = 1000;
  const M = 1000 * 1000;
  const G = 1000 * 1000 * 1000;
  const T = 1000 * 1000 * 1000 * 1000;
  const P = 1000 * 1000 * 1000 * 1000 * 1000;
  return function(input) {
    if (input < K) {
      return input + ' B';
    } else if (input < M) {
      return (input / K).toFixed(1) + ' KB';
    } else if (input < G) {
      return (input / M).toFixed(1) + ' MB';
    } else if (input < T) {
      return (input / G).toFixed(2) + ' GB';
    } else if (input < P) {
      return (input / T).toFixed(3) + ' TB';
    } else {
      return input;
    }
  };
});

app.filter('flowStr2Num', function() {
  const K = 1000;
  const M = 1000 * 1000;
  const G = 1000 * 1000 * 1000;
  const T = 1000 * 1000 * 1000 * 1000;
  const P = 1000 * 1000 * 1000 * 1000 * 1000;
  return function(input) {
    if(!input) {
      return 0;
    } else if(Number.isInteger(+input)) {
      return +input;
    }else if(input.match(/^\d{1,}.?\d{0,}[Kk]$/)) {
      return +input.substr(0, input.length - 1) * K;
    } else if(input.match(/^\d{1,}.?\d{0,}[Mm]$/)) {
      return +input.substr(0, input.length - 1) * M;
    } else if(input.match(/^\d{1,}.?\d{0,}[Gg]$/)) {
      return +input.substr(0, input.length - 1) * G;
    } else if(input.match(/^\d{1,}.?\d{0,}[Tt]$/)) {
      return +input.substr(0, input.length - 1) * T;
    } else  {
      return 1;
    }
  };
});

app.filter('flowNum2Str', function() {
  const K = 1000;
  const M = 1000 * 1000;
  const G = 1000 * 1000 * 1000;
  const T = 1000 * 1000 * 1000 * 1000;
  const P = 1000 * 1000 * 1000 * 1000 * 1000;
  return function(input) {
    if (input < K) {
      return input.toString();
    } else if (input < M) {
      return +(input / K).toFixed(1) + 'K';
    } else if (input < G) {
      return +(input / M).toFixed(1) + 'M';
    } else if (input < T) {
      return +(input / G).toFixed(2) + 'G';
    } else if (input < P) {
      return +(input / T).toFixed(3) + 'T';
    } else {
      return input.toString();
    }
  };
});
