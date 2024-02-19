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

const log4js = require('log4js');
const logger = log4js.getLogger('webgui');
const expressLogger = log4js.getLogger('express');

const config = appRequire('services/config').all();
const os = require('os');
const path = require('path');
const express = require('express');
// const WebSocketServer = require('ws').Server;
const session = require('express-session');
const knex = appRequire('init/knex').knex;
const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({knex});
const sessionParser = session({
    secret: '5E14cd8749A',
    rolling: true,
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false, httpOnly: true, maxAge: 7 * 24 * 3600 * 1000, sameSite: 'lax',},
    store,
});
const bodyParser = require('body-parser');
const compression = require('compression');
const expressValidator = require('express-validator');
const app = express();
const cors = require('cors');

app.set('trust proxy', 'loopback');
app.use(log4js.connectLogger(expressLogger, {
    level: 'auto',
    format: '[:req[host]] [:req[x-real-ip]] :method :status :response-timems :url',
}));

if (config.plugins.webgui.cors) {
    const whitelist = config.plugins.webgui.cors;
    const corsOptions = {
        origin: whitelist,
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    };
    app.use(cors(corsOptions));
}

app.use(bodyParser.json());
app.use(expressValidator());
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionParser);

app.engine('.html', require('ejs').__express);
app.engine('.js', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', path.resolve('./plugins/webgui/views'));

app.use('/libs', express.static(path.resolve('./plugins/webgui/libs')));
app.use('/libs', express.static(path.resolve(os.homedir(), './.ssmgr/libs')));
app.use('/public', express.static(path.resolve('./plugins/webgui/public')));
app.use('/public/views/skin', express.static(path.resolve(os.homedir(), './.ssmgr/skin')));

app.use('/api/*', (req, res, next) => {
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

const port = config.plugins.webgui.port || 8080;
const host = config.plugins.webgui.host || '0.0.0.0';
app.listen(port, host, () => {
    logger.info(`server start at ${host}:${port}`);
}).on('error', err => {
    logger.error('express server error: ' + err);
    process.exit(1);
});

// const wss = new WebSocketServer({
//   server,
//   path: '/user',
//   verifyClient: function (info, done){
//     sessionParser(info.req, {}, function (){
//       // console.log(info.req.session);
//       if(info.req.session.user && info.req.session.type === 'normal') {
//         done(true);
//       } else {
//         done(false);
//       }
//     });
//   }
// });

app.use((err, req, res, next) => res.render('error'));

exports.app = app;
// exports.wss = wss;
// exports.sessionParser = sessionParser;
// exports.dependence = ['webgui_ref', 'group', 'macAccount', 'webgui_order'];

appRequire('plugins/webgui/server/route');
