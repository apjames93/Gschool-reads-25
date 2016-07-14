var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var pg = require('pg');

/* GET home page. */
router.get('/', function(req, res, next) {
  knex('author').innerJoin('author_book', 'author_id', 'author.id').innerJoin('book','book_id', 'book.id').select('author_book.id as author_book_id','author.id as authors_id', 'book.id as books_id' ,'*').then(function(data){
      res.render('index', { book: data });
  });
});
// delete
router.get('/:id/delete-book',function(req,res,next){
  knex('author_book').where({book_id: req.params.id}).del().then(function(data){
    knex('book').where({id: req.params.id}).del().then(function(data){
      res.redirect('/');
    });
  });
});
router.get('/:id/delete-author',function(req,res,next){
  knex('author_book').where({author_id: req.params.id}).del().then(function(data){
    knex('author').where({id: req.params.id}).del().then(function(data){
      res.redirect('/');
    });
  });
});


//book routers
router.get('/book', function(req,res,next){
  knex('book').then(function(data){
    res.render('book', {data: data});
  });
});
router.get('/:id/book-info', function(req,res,next){
  knex('book').where({id: req.params.id}).then(function(data){
      res.render('book-info', {data: data[0]});
    });
});
router.post('/:id/book-info',function(req,res,next){
    knex('book').where({id:req.params.id}).update(req.body).then(function(data){
      res.redirect('/');
    });
});
//author router
router.get('/author', function(req,res,next){
  knex('author').select().then(function(data){
    res.render('author', {data: data});
  });
});
router.get('/:id/author-info', function(req,res,next){
    knex('author').select().where({id: req.params.id, }).then(function(data){
      res.render('author-info', {data: data[0]});
    });
});
router.post('/:id/author-info',function(req,res,next){
    knex('author').where({id:req.params.id}).update(req.body).then(function(data){
      res.redirect('/');
    });
});
//add a new book
router.get('/add', function(req, res, next ){
  res.render('add');
});
//
// ///add new book

router.post('/add', function(req, res, next){

  return knex('author').select('id').where({first_name: req.body.first_name, last_name: req.body.last_name}).returning('id').then(function(author){
    if(author[0] === undefined){
      return knex('author').insert({first_name:req.body.first_name,last_name: req.body.last_name, biography: req.body.biography, portrait: req.body.portrait}).returning('id');

    } return id
  }).then(function(author){
    return knex('book').select('id').where({title: req.body.title}).returning('book.id')
    .then(function(book){
      if(book[0] === undefined){
        return  knex('book').insert({title: req.body.title, genre: req.body.genre, description: req.body.description, cover: req.body.cover}).returning('id');
      }
    }).then(function(book){
      return knex('author_book').insert({book_id: book[0], author_id: author[0]});
    }).then(function(){
      res.redirect('/')
    })
  })
})




module.exports = router;
