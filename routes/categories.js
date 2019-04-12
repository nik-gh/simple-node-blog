const express = require('express');
// const mongo = require('mongodb');
const { DB } = require('../helper');
const db = require('monk')(DB);

const router = express.Router();

router.get('/show/:category', (req, res, next) => {
  const { db } = req;
  const posts = db.get('posts');
  posts.find({ category: req.params.category }, {}, (err, posts) => {
    res.render('index', {
      title: req.params.category,
      posts,
    });
  });
});

router.get('/add', (req, res) => {
  res.render('addcategory', {
    title: 'Add Category',
  });
});

router.post('/add', (req, res) => {
  // Ger form values
  const { title } = req.body;

  // Form Validation

  req.checkBody('title', 'Title field is required').notEmpty();

  // Check Errors

  const errors = req.validationErrors();

  if (errors) {
    res.render('addcategory', {
      errors,
      title,
    });
  } else {
    const categories = db.get('categories');

    // Submit to db
    categories.insert({
      title,
    }, (err, category) => {
      if (err) {
        res.send('There was an issue submitting the category');
      } else {
        req.flash('success', 'Category Submitted');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});

module.exports = router;
