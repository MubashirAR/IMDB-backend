const mongoose = require('mongoose');
const { GENRES } = require('../constants');
const Types = mongoose.Schema.Types;

module.exports.connect = () => {
  mongoose.connect('mongodb+srv://mubashir:foodApp@cluster0-im53z.mongodb.net/imdb?retryWrites=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
const User = mongoose.model('User', {
  email: {
    type: Types.String,
  },
  name: {
    type: Types.String,
    index: true,
  },
});
const Movie = mongoose.model('Movie', {
  '99popularity': {
    type: Types.Number,
    index: true,
  },
  director: {
    type: Types.String,
    index: true,
  },
  genre: {
    type: [Types.String],
    enum: GENRES
  },
  imdb_score: {
    type: Types.Number,
    index: true,
  },
  name: {
    type: Types.String,
    index: true,
  },
  _createdBy: {
    type: Types.ObjectId,
    ref: 'User'
  },
});
module.exports.models = {
  Movie,
  User
};
