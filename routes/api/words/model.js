const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const wordSchema = new Schema({
  antonyms: [{ type: String }],
  canSpell: { type: Boolean, default: false },
  canEToU: { type: Boolean, default: false },
  canUToE: { type: Boolean, default: false },
  description: String,
  examples: [{ type: String }],
  lastVerifiedAt: Date,
  partOfSpeech: {
    type: String,
    // adjective, adverb, conjunction, interjection, noun, phrasal verb, preposition, pronoun, verb
    enum: ['adj', 'adv', 'conj', 'interj', 'n', 'ph v', 'prep', 'pron', 'v']
  },
  pastParticiple: String,
  plural: String,
  simplePast: String,
  synonyms: [{ type: String }],
  tags: [{ type: String }],
  toVerifyNextTime: { type: Boolean, default: false },
  transcription: String,
  translation: String,
  word:  { type: String, required: true, unique: true },
}, { timestamps: true });

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
