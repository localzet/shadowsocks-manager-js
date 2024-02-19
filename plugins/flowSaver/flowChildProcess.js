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

const process = require('process');
const moment = require('moment');

const splitTime = (start, end) => {
  const time = {
    day: [],
    hour: [],
    fiveMin: [],
    origin: [],
  };
  const now = Date.now();
  const getMinute = moment(now).get('minute');
  const splitEnd = {
    day: moment(now).hour(0).minute(0).second(0).millisecond(0).toDate().getTime(),
    hour: moment(now).minute(0).second(0).millisecond(0).toDate().getTime(),
    fiveMin: moment(now).minute(getMinute - getMinute%5).second(0).millisecond(0).toDate().getTime(),
  };
  const isDay = time => {
    const hour = moment(time).get('hour');
    const minute = moment(time).get('minute');
    const second = moment(time).get('second');
    const millisecond = moment(time).get('millisecond');
    if(hour || minute || second || millisecond) {
      return false;
    }
    return true;
  };
  const isHour = time => {
    const minute = moment(time).get('minute');
    const second = moment(time).get('second');
    const millisecond = moment(time).get('millisecond');
    if(minute || second || millisecond) {
      return false;
    }
    return true;
  };
  const is5min = time => {
    const minute = moment(time).get('minute');
    const second = moment(time).get('second');
    const millisecond = moment(time).get('millisecond');
    if(minute%5 || second || millisecond) {
      return false;
    }
    return true;
  };
  const next = (time, type) => {
    if(type === 'day') {
      return moment(time).add(1, 'days').hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
    }
    if(type === 'hour') {
      return moment(time).add(1, 'hours').minute(0).second(0).millisecond(0).toDate().getTime();
    }
    if(type === '5min') {
      const getMinute = moment(time).get('minute');
      return moment(time).minute(getMinute - getMinute%5).add(5, 'minutes').second(0).millisecond(0).toDate().getTime();
    }
  };
  let timeStart = start;
  let timeEnd = end;
  let last = 'origin';
  while(timeStart < timeEnd) {
    if(isDay(timeStart) && next(timeStart, 'day') <= splitEnd.day && next(timeStart, 'day') <= end) {
      if(last === 'day' && time.day.length) {
        const length = time.day.length;
        time.day[length - 1] = [
          time.day[length - 1][0],
          next(timeStart, 'day')
        ];
      } else {
        time.day.push([timeStart, next(timeStart, 'day')]);
      }
      timeStart = next(timeStart, 'day');
      last = 'day';
    } else if(isHour(timeStart) && next(timeStart, 'hour') <= splitEnd.hour && next(timeStart, 'hour') <= end) {
      if(last === 'hour' && time.hour.length) {
        const length = time.hour.length;
        time.hour[length - 1] = [
          time.hour[length - 1][0],
          next(timeStart, 'hour')
        ];
      } else {
        time.hour.push([timeStart, next(timeStart, 'hour')]);
      }
      timeStart = next(timeStart, 'hour');
      last = 'hour';
    } else if(is5min(timeStart) && next(timeStart, '5min') <= splitEnd.fiveMin && next(timeStart, '5min') <= end) {
      if(last === '5min' && time.fiveMin.length) {
        const length = time.fiveMin.length;
        time.fiveMin[length - 1] = [
          time.fiveMin[length - 1][0],
          next(timeStart, '5min')
        ];
      } else {
        time.fiveMin.push([timeStart, next(timeStart, '5min')]);
      }
      timeStart = next(timeStart, '5min');
      last = '5min';
    } else if(next(timeStart, '5min') <= end && timeStart === start) {
      time.origin.push([timeStart, next(timeStart, '5min')]);
      timeStart = next(timeStart, '5min');
      last = '5min';
    } else {
      time.origin.push([timeStart, timeEnd]);
      timeStart = timeEnd;
      last = 'origin';
    }
  }
  return time;
};

const sumFlow = result => {
  return result.length ? result.reduce((a, b) => a + b) : 0;
};

process.on('message', msg => {
  if(msg[0] === 'splitTime') {
    const time = splitTime(msg[2], msg[3]);
    process.send(['splitTime', msg[1], time]);
  } else if (msg[0] === 'sumFlow') {
    const flow = sumFlow(msg[2]);
    process.send(['sumFlow', msg[1], flow]);
  } 
});

