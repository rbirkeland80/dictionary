const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const wordSchema = new Schema({
  antonyms: [{ type: String }],
  canSpell: { type: Boolean, default: false },
  canEToU: { type: Boolean, default: false },
  canUToE: { type: Boolean, default: false },
  description: String,
  examples: [{ type: String }],
  partOfSpeech: [{
    type: String,
    // adjective, adverb, conjunction, interjection, noun, preposition, pronoun, verb
    enum: ['adj', 'adv', 'conj', 'interj', 'n', 'prep', 'pron', 'v']
  }],
  synonyms: [{ type: String }],
  tags: [{ type: String }],
  transcription: String,
  translation: String,
  value:  { type: String, required: true, unique: true },
}, { timestamps: true });

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
