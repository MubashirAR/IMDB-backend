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
    unique: true
  },
  name: {
    type: Types.String,
    index: true,
  },
});
const Genre = mongoose.model('Genre', {
  name: {
    type: Types.String,
  }
});
const Movie = mongoose.model('Movie', {
  '99popularity': {
    type: Types.Number,
    index: true,
    min: 0,
    max: 100
  },
  director: {
    type: Types.String,
    index: true,
  },
  genre: {
    type: [Types.String],
  },
  imdb_score: {
    type: Types.Number,
    index: true,
    min: 0,
    max: 10
  },
  name: {
    type: Types.String,
    index: true,
  },
  _createdBy: {
    type: Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Types.Boolean,
    default: true
  }
});
module.exports.models = {
  Movie,
  User,
  Genre
};
