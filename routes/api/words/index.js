const routes = require('express').Router();
const Word = require('./model.js');
const BaseCrud = require('../common/index.js');

const WordCrud = new BaseCrud(Word);

routes.route('/')
  .get((req, res) => WordCrud.getAllEntries(req, res))
  .post((req, res) => WordCrud.saveNewEntry(req, res));

routes.param('id', (req, res, next, id) => WordCrud.checkIdParam(req, res, next, id));

routes.route('/:id')
  .get((req, res) => WordCrud.getEntryById(req, res))
  .put((req, res) => WordCrud.updateEntryById(req, res))
  .delete((req, res) => WordCrud.deleteEntryById(req, res));

module.exports = routes;
