const routes = require('express').Router();
const Word = require('./model.js');
const BaseCrud = require('../common/index.js');

const QUIZ_TYPE_NEWEST = 'newest';
const QUIZ_TYPE_OLDEST = 'oldest';
const QUIZ_TYPE_RANDOM = 'random';

class WordCrud extends BaseCrud {
  constructor(Word) {
    super(Word);
  }

  async generateQuiz(req, res) {
    const {
      includeToVerify,
      maxCount,
      type = QUIZ_TYPE_NEWEST,
      limit = 50,
      skip = 0,
      fields
    } = req.body;
    const project = {};
    const createdAtDirection = type === QUIZ_TYPE_NEWEST ? -1 : 1;
    fields.forEach(prop => project[prop] = 1);

    const includeToVerifySet = includeToVerify
      ? []
      : [{ $match: { toVerifyNextTime: { $ne: true } } }];
    const randomSet = type === QUIZ_TYPE_RANDOM
      ? [{ $sample: { size: maxCount || 50 } }]
      : [];
    const sortSet = type === QUIZ_TYPE_NEWEST || type === QUIZ_TYPE_OLDEST
      ? [{ $sort: { createdAt : createdAtDirection } }]
      : [];

    try {
      const totalCountAggr = await this.model.aggregate([
        ...includeToVerifySet,
        { $count: 'count' }
      ]);
      const totalCount = totalCountAggr[0] && totalCountAggr[0].count;
      const count = totalCount <= maxCount ? totalCount : maxCount;

      const data = await this.model.aggregate([
        ...includeToVerifySet,
        ...randomSet,
        ...sortSet,
        { $skip : skip },
        { $limit : limit },
        { $project : project }
      ]);

      res.json({ list: data, count, limit, skip });
    } catch(error) {
      this.handleErrorResponse(error, res);
    }
  }
}

const wordCrud = new WordCrud(Word);

routes.route('/')
  .get((req, res) => wordCrud.getAllEntries(req, res))
  .post((req, res) => wordCrud.saveNewEntry(req, res));

routes.route('/quiz')
  .post((req, res) => wordCrud.generateQuiz(req, res));

routes.param('id', (req, res, next, id) => wordCrud.checkIdParam(req, res, next, id));

routes.route('/:id')
  .get((req, res) => wordCrud.getEntryById(req, res))
  .put((req, res) => wordCrud.updateEntryById(req, res))
  .delete((req, res) => wordCrud.deleteEntryById(req, res));

module.exports = routes;
