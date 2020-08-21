var mongoose = require('mongoose');
var express = require('express');

const constants = require('../constants');
const { GENRES } = require('../constants');
const authenticate = require('../middleware/authenticate');
var router = express.Router();
const { Movie, Genre } = require('../lib/dbConnection').models;
/* GET users listing. */
router.get('/single', authenticate, async function (req, res) {
  let { movieId } = req.query;
  Movie.findById(movieId)
    .then((resp) =>
      res.send({
        msg: 'Fetched movie successfully',
        data: resp,
      })
    )
    .catch((e) => {
      console.log(e);
      res.status(500).send({
        msg: 'An unexpected error occured. Please try again!',
      });
    });
});
router.get('/', async function (req, res) {
  let { limit, skip, sortBy, reverse, searchVal, genre } = req.query;
  if (!isNaN(limit)) limit = parseInt(limit);
  if (!isNaN(skip)) skip = parseInt(skip);
  if (limit > 50)
    res.status(400).send({
      msg: 'Limit can at most be 50',
    });
  let sort = sortBy && !isNaN(reverse) ? { [sortBy]: Number(reverse) } : { '99popularity': 1 };
  let query = searchVal
    ? {
        $or: [
          {
            director: new RegExp(searchVal + 'w*', 'g'),
          },
          {
            name: new RegExp(searchVal + 'w*', 'g'),
          },
        ],
        isActive: true
      }
    : { isActive: true };
  if (genre) query.genre = { $all: genre.split(',') };
  console.log(query);
  Movie.find(query)
    .sort(sort)
    .skip(skip || 0)
    .limit(limit || constants.PAGE_SIZE)
    .then((resp) =>
      res.send({
        msg: 'Fetched movies successfully',
        data: resp,
      })
    )
    .catch((e) => {
      console.log(e);
      res.status(500).send({
        msg: 'An unexpected error occured. Please try again!',
      });
    });
});
router.get('/genres', async function (req, res) {
  res.send({
    msg: 'Genre list fetched successfully!',
    data: { genres: GENRES },
  });
});
router.post('/', authenticate, (req, res) => {
  Movie.create({ ...req.body, _createdBy: req.session.user._id, isActive: true })
    .then((data) => {
      res.send({
        msg: 'Movie added successfully',
        data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        msg: `Sorry couldn't complete your request. Please try again.`,
      });
    });
});
router.put('/', authenticate, (req, res) => {
  // Ideally genres and movies should be linked via primary key foreign key
  let newGenres = [];
  Genre.find({
    name: {
      $in: req.body.genre,
    },
  })
  .lean()
  .exec()
  .then((genres) => {
    let existing = new Map();
    genres.map((g) => existing.set(g.name));
    req.body.genres.map((g) => (existing.has(g) ? null : newGenres.push({ name: g })));
  })
  .then((_) => {
    if (newGenres.length) return Genre.insertMany(newGenres);
  })
  .then((_) => Movie.updateOne({ _id: req.body.modelId }, { ...req.body, _createdBy: req.session.user._id }))
  .then((data) => {
    res.send({
      msg: 'Movie updated successfully',
      data,
    });
  })
  .catch((err) => {
    res.status(500).send({
      msg: `Sorry couldn't complete your request. Please try again.`,
    });
  });
});
router.delete('/', authenticate, (req, res) => {
  console.log(req.body);
  Movie.updateOne({ _id: req.body.modelId }, { isActive: false })
    .then((data) => {
      res.send({
        msg: 'Movie deleted successfully',
        data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        msg: `Sorry couldn't complete your request. Please try again.`,
      });
    });
});
module.exports = router;
