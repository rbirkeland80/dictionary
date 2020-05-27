const routes = require('express').Router();
const words = require('./words');

routes.get('/', function(req, res) {
  res.send('im the api node!'); 
});

routes.use('/words', words);

module.exports = routes;
