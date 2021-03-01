const express = require('express');
const path = require('path');

const router = express.Router();
router.get('/favicon.ico', (req, res) => { res.writeHead(404); res.end(); });
router.use(express.static(path.join(__dirname, '../node_modules/vue/dist')));
router.use(express.static(path.join(__dirname, '../node_modules/vuetify/dist')));
router.use('/css', express.static(path.join(__dirname, '../node_modules/@mdi/font/css')));
router.use('/fonts', express.static(path.join(__dirname, '../node_modules/@mdi/font/fonts')));

module.exports = router;
