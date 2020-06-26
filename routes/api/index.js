const routes = require('express').Router();
const words = require('./words');

routes.get('/', (req, res) => res.send('The api node!'));

routes.use('/words', words);

module.exports = routes;
