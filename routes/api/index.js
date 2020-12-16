const routes = require('express').Router();
const words = require('./words');

routes.get('/', (req, res) => res.send('SUCCESS: The api node!'));

routes.use('/words', words);

module.exports = routes;
