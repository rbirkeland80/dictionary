const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: String,
  email: { type: String, unique: true },
  name: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

module.exports.createUser = async (newUser) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);

    newUser.password = hash;

    return await newUser.save();
  } catch(er) {
    throw err;
  }
};

module.exports.comparePassword = async (candidatePassword, hash) => {
  try {
    return await bcrypt.compare(candidatePassword, hash);
  } catch (er) {
    throw err;
  }
};
