const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

class Server {
  constructor() {
    this.initDB();
    this.initExpressMiddleware();
    this.initRoutes();
    this.start();
  }

  initDB() {
    const configDB = require('./config/database.js');
    const url = process.env.NODE_ENV === 'prod' ? configDB.PROD : configDB.TEST;

    mongoose.Promise = global.Promise;
    mongoose
      .connect(url, { useNewUrlParser: true })
      .catch(er => {
        console.log('Troubles with db connection. Please double check your settings', er);
        this.server && this.server.close();
        process.exit(0);
      });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('openUri', function () {
      console.log('connected to db');
    });
  }

  initExpressMiddleware() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors({ origin: 'http://localhost:3000' }));
  }

  initRoutes() {
    const api = require('./routes/api');

    app.use('/api', api);
    app.use('/', (req, res) => res.status(404).send('Not found'));
    app.get('*', (req, res) => res.redirect('/'));
  }

  start() {
    this.server = app.listen(port, function () {
      console.log(`Listening on port ${port}...`);
    });
  }
}

new Server();
