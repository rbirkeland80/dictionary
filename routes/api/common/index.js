const defaultErrorMsg = 'Unexpected error happened. Please try again later.';

function handleErrorResponse (error, res) {
  const code = setResponseCode(error);
  const msg = error.message || defaultErrorMsg;

  if (error.code === 412) {
    // preConditionFailed
    error.message = 'System was not able to save your request. Please make sure that your are properly logged in the system.';
  }

  res.status(code).send(msg);
};

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
        handleErrorResponse(error, res);
      });
  }

  getAllEntries(req, res) {
    const params = req.query;
    const limit = Number(params.rowsPerPage) || 100;
    const skip = Number(params.pageNum) * Number(params.rowsPerPage) - Number(params.rowsPerPage) || 0;
    let totalCount = 0;

    return this.model.countDocuments()
      .then(data => {
        if (!data || data === 0) {
          return [];
        }

        totalCount = data;

        return this.model.find().select('value canEToU canUToE').limit(limit).skip(skip)
      })
      .then(data => {
        res.json({ list: data, count: totalCount });
      })
      .catch(error => {
        handleErrorResponse(error, res);
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
        handleErrorResponse(error, res);
      });
  }

  saveNewEntry(req, res) {
    const collection = new this.model(req.body);

    return collection.save()
      .then(collection => {
        res.json(collection);
      })
      .catch(error => {
        handleErrorResponse(error, res);
      });
  }

  updateEntryById(req, res) {
    return this.model.findOneAndUpdate({ _id: req.params.id }, { new: true })
      .then(data => {
        if (data === null) {
          return res.status(204).send('There is nothing to update');
        }

        res.json(data);
      })
      .catch(error => {
        handleErrorResponse(error, res);
      });
  }
};

module.exports = BaseCrud;
