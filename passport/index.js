const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('../routes/auth/model');

passport.use(new LocalStrategy(async (username, password, cb) => {
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    console.log(isMatch);

    return isMatch
      ? cb(null, user, {message: 'Logged In Successfully'})
      : cb(null, false, {message: 'Invalid password'});
  } catch(er) {
    cb(er);
  }
}));

passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  },
  async (jwtPayload, cb) => {
    try {
      const user = await User.findOne({ username: jwtPayload.username });

      return cb(null, user);
    } catch(er) {
      return cb(er);
    }
  }
));
