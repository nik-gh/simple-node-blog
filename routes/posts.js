const express = require('express');
const path = require('path');
// const mongo = require('mongodb');
const { DB } = require('../helper');
const db = require('monk')(DB);

const router = express.Router();

router.get('/show/:id', (req, res) => {
  const posts = db.get('posts');

  posts.findOne({_id: req.params.id }, (err, post) => {
    res.render('show', {
      post,
    });
  });
});

router.get('/add', (req, res) => {
  const categories = db.get('categories');
  categories.find({}, {}, (err, categories) => {
  // categories.find({}, {}, (err) => {
    res.render('addpost', {
      title: 'Add Post',
      categories,
    });
  });
});

router.post('/add', (req, res) => {
  // Ger form values
  const { title } = req.body;
  const { category } = req.body;
  const { body } = req.body;
  const { author } = req.body;
  const date = new Date();

  let mainImageName, mainImageExt;

  if (req.file) {
    const mainImageOriginalName = req.file.originalname;
    const mainImageMime = req.file.mimetype;
    const mainImagePath = req.file.path;
    mainImageExt = path.extname(mainImageOriginalName);
    mainImageName = req.file.filename;
    const mainImageSize = req.file.size;
  } else {
    mainImageName = 'noimage.png';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors
  const errors = req.validationErrors();

  if (errors) {
    const categories = db.get('categories');
    categories.find({}, {}, (err, categories) => {
      res.render('addpost', {
        errors,
        categories,
        title,
        body,
      });
    });
  } else {
    const posts = db.get('posts');

    // Submit to db
    posts.insert({
      title,
      body,
      category,
      date,
      author,
      image: mainImageName,
    }, (err, post) => {
      if (err) {
        res.send('There was an issue submitting the post');
      } else {
        req.flash('success', 'Post Submitted');
        res.location('/');
        res.redirect('/');
      }
    });
  }
});


router.post('/addcomment', (req, res, next) => {
  // Ger form values
  const { name } = req.body;
  const { email } = req.body;
  const { body } = req.body;
  const { postid } = req.body;
  const commentdate = new Date();

  // Form Validation

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not formatted correctly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();

  // Check Errors

  const errors = req.validationErrors();

  if (errors) {
    const posts = db.get('posts');
    posts.findOne({ _id: postid }, (err, post) => {
      res.render('show', {
        err,
        post,
      });
    });
  } else {
    const comment = {
      name,
      email,
      body,
      commentdate,
    };

    const posts = db.get('posts');

    posts.update({
      _id: postid,
    }, {
      $push: {
        comments: comment,
      },
    }, (err, doc) => {
      if (err) {
        throw err;
      } else {
        req.flash('success', 'Comment Added');
        res.location(`/posts/show/${postid}`);
        res.redirect(`/posts/show/${postid}`);
      }
    });
  }
});

module.exports = router;
