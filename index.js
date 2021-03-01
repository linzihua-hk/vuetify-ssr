const express = require('express');
const session = require('express-session');
const libs = require('./utils/libs');
const renderer = require('./utils/vuetify-renderer').createRenderer();

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
    let data = {
        url: req.url,
        count,
        p1: req.body.p1,
        p2: req.body.p2,
    };
    let context = {
        title: 'Vuetify SSR Template',
        keywords: '123',
        description: '345'
    };
    renderer.renderer(res, 'Home', data, context);
});

module.exports = server;
