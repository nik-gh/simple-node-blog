const express = require('express');
// let mongo = require('mongodb');
const { DB } = require('../helper');
const db = require('monk')(DB);

const router = express.Router();

/* GET home page blog post */
router.get('/', (req, res) => {
  // const { db } = req;
  const posts = db.get('posts');
  posts.find({}, {}, (err, posts) => {
    res.render('index', {
      posts,
    });
  });
});

module.exports = router;
