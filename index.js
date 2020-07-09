const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');

require('./passport');

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
    const url = process.env.NODE_ENV === 'production' ? configDB.PROD : configDB.TEST;

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
    db.once('openUri', () => console.log('connected to db'));
  }

  initExpressMiddleware() {
    const configClient = require('./config/client.js');
    const url = process.env.NODE_ENV === 'production' ? configClient.PROD : configClient.LOCAL;
    app.use(session({
      secret: 'secret',
      saveUninitialized: true,
      resave: true
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cors({ origin: url }));
    app.use(passport.initialize());
    app.use(passport.session());
  }

  initRoutes() {
    const api = require('./routes/api');
    const auth = require('./routes/auth');

    app.use('/auth', auth);
    app.use('/api', passport.authenticate('jwt', {session: false}), api);
    app.use('/', (req, res) => res.status(404).send('Not found'));
    app.get('*', (req, res) => res.redirect('/'));
  }

  start() {
    this.server = app.listen(port, () => console.log(`Listening on port ${port}...`));
  }
}

new Server();
