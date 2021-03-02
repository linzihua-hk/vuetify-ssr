const express = require('express');
const session = require('express-session');
const libs = require('./utils/libs');
const renderer = require('./utils/vuetify-renderer').createRenderer({
    title: 'Vuetify SSR',
    keywords: '',
    description: '',
});

const server = express();
server.use(libs);
server.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 600000 }
}));
server.use(express.urlencoded({ extended: true }));
server.use((req, res) => {
    let count = parseInt(req.session.count);
    if (!count) {
        count = 1;
    } else {
        count++;
    }
    req.session.count = count;
    renderer.renderToString(res, 'Home', {
        vue: {
            url: req.baseUrl + req.path,
            count,
            p1: req.body.p1,
            p2: req.body.p2,
        },
        vuetify: {
            url: req.baseUrl + req.path,
        },
        html: {
            title: req.path
        }
    });
});

module.exports = server;
