const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('./model');

router.get('/logout', (req, res) => {
  req.logout();
  res.send(null);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }

    req.login(user, {session: false}, (err) => {
      if (err) {
        res.send(err);
      }

      const { name, password, username } = user;
      const token = jwt.sign({ name, password, username }, 'your_jwt_secret');

      return res.json({ user: { name, username }, token });
    });
  })(req, res);
});

// router.post('/register', async (req, res) => {
//   const password = req.body.password;
//   const password2 = req.body.password2;

//   if (password !== password2) {
//     res.status(500).send("{errors: \"Passwords don't match\"}").end();
//   }

//   const newUser = new User({
//     name: req.body.name,
//     email: req.body.email,
//     username: req.body.username,
//     password: req.body.password
//   });

//   try {
//     const user = await User.createUser(newUser);

//     res.send(user).end();
//   } catch(er) {
//     const duplicate = err.message.includes('duplicate key error');

//     duplicate
//       ? res.status(400).send("{errors: \"User already exists\"}").end()
//       : res.status(400).send("{errors: \"Something went wrong\"}").end()
//   }
// });

module.exports = router;
