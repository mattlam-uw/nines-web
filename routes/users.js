/**
 * Router for /users
 */

// Node.js module dependencies
var express = require('express');
var router = express.Router();
var Users = require('../models/Users_Mongo');
// var logger = require('../modules/logger.js);

// Methods used by export method
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users');
}

module.exports = function(passport) {

    // GET Login page
    router.get('/', function(req, res) {
        // Display the Login page with message, if applicable
        res.render('index');
    });

    // Handle Login POST
    router.post('/login', passport.authenticate(
        'login',
        {
            successRedirect: 'home',
            failureRedirect: '/users',
            failureFlash: true
        }
    ));

    // GET Registration page
    router.get('/register', function(req, res) {
        res.render('register);
    });

    // Handle Registration POST
    router.post('/register', passport.authenticate(
        'register',
        {
            successRedirect: 'home',
            failureRedirect: 'register',
            failureFlash: true
        }
    ));

    // GET Home page
    router.get('home', isAuthenticated, function(req, res) {
        res.render('home', { user: req.user });
    });

    // GET all users
    router.get('/users', isAuthenticated, function(req, res) {
        Users.find(function(err, returnVal) {
            if (err) return next(err);
            res.json(returnVal);
        });
    });

    // Handle Logout 
    router.get('/users', function(req, res) {
        req.logout();
        res.redirect('/users');
    });

    return router;
};
