function setResponseCode (error) {
  if (error.code >= 400 && error.code <= 599) {
    return error.code;
  }

  if (error.code === 11000 || error.code === 11001) {
    return 409; //conflict - duplicate entry
  }

  if (error.name === 'ValidationError') {
    return 422;
  }

  return 500;
};

class BaseCrud {
  constructor(model) {
    this.model = model;
    this.defaultErrorMsg = 'Unexpected error happened. Please try again later.';
  }

  checkIdParam(req, res, next, id) {
    if (!/^\w+$/.test(id)) {
      next(new Error('Logging that someone is trying to reach document with invalid id format.'));
    }

    next();
  }

  deleteEntryById(req, res) {
    return this.model.findByIdAndRemove().where('_id').equals(req.params.id)
      .then(data => {
        if (data === null) {
          return res.status(204).send('There is nothing to delete');
        }

        res.send(data);
      })
      .catch(error => {
        this.handleErrorResponse(error, res);
      });
  }

  getAllEntries(req, res) {
    const params = req.query;
    const limit = Number(params.limit) || 50;
    const skip = Number(params.skip) || 0;
    const fields = (params.fields && params.fields.join(' ')) || '';
    let totalCount = 0;

    return this.model.countDocuments()
      .then(data => {
        if (!data || data === 0) {
          return [];
        }

        totalCount = data;

        return this.model
          .find()
          .select(fields)
          .sort({ toVerifyNextTime: -1, createdAt: -1 })
          .limit(limit)
          .skip(skip);
      })
      .then(data => {
        res.json({ list: data, count: totalCount, limit, skip });
      })
      .catch(error => {
        this.handleErrorResponse(error, res);
      });
  }

  getEntryById(req, res) {
    return this.model.findOne().where('_id').equals(req.params.id)
      .then(data => {
        if (!data || data.length === 0) {
          return res.status(204).send(data);
        }

        res.json(data);
      })
      .catch(error => {
        this.handleErrorResponse(error, res);
      });
  }

  handleErrorResponse (error, res) {
    const code = setResponseCode(error);
    const msg = error.message || defaultErrorMsg;
  
    if (error.code === 412) {
      // preConditionFailed
      error.message = 'System was not able to save your request. Please make sure that your are properly logged in the system.';
    }
  
    res.status(code).send(msg);
  };

  async saveNewEntry(req, res) {
    const { data } = req.body;
    const resData = {
      errors: [],
      success: []
    };
    let currentItem = null;

    if (!data || !data.length) {
      res.status(422).send('Data is missing');

      return;
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      try {
        currentItem = item;
        const collection = new this.model(item);
        const result = await collection.save();
        resData.success.push(result);
      } catch(error) {
        resData.errors.push({
          item: currentItem,
          error
        });
      }
    }

    const code = resData.errors.length ? 422 : 200;
    res.status(code).json(resData);
  }

  updateEntryById(req, res) {
    const data = req.body;

    return this.model.findOneAndUpdate({ _id: req.params.id }, { ...data }, { new: true, useFindAndModify: false })
      .then(data => {
        if (data === null) {
          return res.status(204).send('There is nothing to update');
        }

        res.json(data);
      })
      .catch(error => {
        this.handleErrorResponse(error, res);
      });
  }
};

module.exports = BaseCrud;
