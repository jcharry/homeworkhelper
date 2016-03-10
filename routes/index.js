var express = require('express');
var router = express.Router();
var login = require('../src/login.js');
var Account = require('../models/account.js');
var Request = require('../models/request.js');
var Message = require('../models/message.js');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('landing', { });
});

router.get('/about', function(req, res, next) {
});

router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', function(req, res) {
    console.log(req.body.account_type);
    
    // Register a new user
    Account.register(new Account({username: req.body.username, accountType: req.body.account_type}), req.body.password, function(err, account) {

        // TODO: Better error handling here
        if (err) {
            console.log(err);
            return res.render('register', {account: account, err: err});
        }

        // Authenticate user right away, such that they login automatically
        passport.authenticate('local')(req, res, function() {
            // Redirect to Dashbaord - I can access the user from there
            res.redirect('/dashboard');
        });
    });
});

router.get('/login', function(req, res, next) {
    res.render('login');
});     
router.post('/login', passport.authenticate('local'), function(req, res, next) {
    res.redirect('/dashboard');
});


router.get('/dashboard*', function(req, res, next) {

    if (req.user) {

        // check session?
        console.log(req.user);
        console.log(req.session);


        // Figure out type of account
        var student, tutor;
        if (req.user.accountType === 'student') {
            student = req.user;
        } else {
            tutor = req.user;
        }

        var myrequests = [];
        // Find requests based on user account type
        if (tutor) {
            // Go out to mongo and get all requests
            Request.find(function(err, docs) {
                if (err) {
                    console.log(err);
                }
                //requests = docs;
                res.render('dashboard', {tutor: tutor});
            });
        } else { 
            // Get only requests posted by currently logged in user
            Request.find({poster: req.user._id})
            .sort({submit_date: -1})
            .exec(function(err, docs) {
                if (err) {
                    console.log(err);
                }
                console.log(docs);

                // Do any of the requests have responders?
                for (var j = 0; j < docs.length; j++) {
                    console.log(docs[j].hasResponder);
                }
                
                res.render('dashboard', {
                    student: student, 
                    results: docs,
                });
            });
        }
    } else {
        res.redirect('/login');
    }
});


router.post('/dashboard', function(req, res, next) {

    var newRequest = new Request({
        subject: req.body.subject,
        description: req.body.description,
        bid: req.body.bid,
        poster: req.user._id,
        submit_date: new Date()
    });

    console.log(newRequest);

    newRequest.save(function(err) {
        if (err) {
            console.log('error on saving: ' + err);
        }
    });

    res.redirect('/dashboard');
});

router.get('/search*', function(req, res, next) {
    console.log(req.query);
    // Only if the user exists
    if (req.user) {
        // Get search parameters from url query
        var subject = req.query.bysubject;

        // Find requests matching params
        // Only search if there are query params
        if(subject) {
            Request.find({subject: subject}).sort({submit_date: -1}).exec(function(err, docs) {
                if (err) {
                    console.log(err);
                    res.redirect('/search');
                    return false;
                }
                console.log(docs);
                res.render('search', {results: docs});
            });
        }
    } else {
        res.redirect('/login');
    }
});

router.post('/offerHelp', function(req, res, next) {
    // Get request from database
    Request.findById(req.body.request_id, function(err, request) {
        var tutorId = req.user._id;

        // Push user into responders list
        if (request.responders.indexOf(tutorId) === -1) {
            request.responders.push(req.user.id);
        }
        console.log(request.responders);
        request.hasResponder = true;

        // Save object
        request.save();

        res.redirect('/search?');
    });
});

router.post('/acceptHelp', function(req, res, next) {
    
    console.log(req.body.accountId);
    console.log(req.body);
    Account.findById(req.body.accountId, function(err, account) {
        if (err) {
            console.log(err);
            return false;
        }

        // Find request
        Request.findById(req.body.requestId, function(err, doc) {
            if (err) {
                console.log(err);
                return false;
            }

            console.log(doc);
            doc.shouldShowChosenResponder = true;
            doc.chosenResponder.username = account.username;
            doc.chosenResponder.id = account._id;
            doc.status = 'in progress';

            // set hasResponder to null so that the button doesn't render, and I can instead render a different button
            doc.hasResponder = null;
            doc.save();
            
            res.send(account);
        });
    });
});

router.get('/request*', function(req, res, next) {
    console.log(req.query);
    //find request associated with id
    Request.findById(req.query.id, function(err, request) {
        if (err) {
            alert(err);
            return false;
        }

        // Find all associated responders
        Account.find({
            '_id': { $in: request.responders}
        }, function(err, docs) {
            console.log('All Accounts associated with a request');
            console.log(docs);
            res.render('accountBlock', {layout: 'none', accounts: docs});
        });
    });
});

router.get('/getMessages', function(req, res, next) {
});

router.post('/sendMessage', function(req, res, next) {
    var studentId = req.user.accountType === 'student' ? req.user._id : req.body.studentId;
    var tutorId = req.user.accountType === 'tutor' ? req.user._id : req.body.tutorId; 
    var requestId = req.body.requestId;

    // Save new message
    var message = new Message({
        studentId: studentId,
        tutorId: tutorId,
        submit_date: new Date(),
        message: req.body.message,
        requestId: req.body.requestId
    });
    message.save(function(err) {
        if (err) {
            console.log(err);
        }

        // TODO: This should really happen in it's route, but it's fine
        // for now
        // Also, we're fetching ALL messages every time, 
        // not effecient at all but easy for now
        // Get message from database
        Message.find({'studentId': studentId, 'tutorId': tutorId, 'requestId': requestId}).sort({submit_date: 1}).exec(function(err, docs) {
            if (err) {
                console.log(err);
            }
            console.log('docs');
            console.log(docs);
            res.render('messages', {layout: 'none', messages: docs});
        });
    });
});

module.exports = router;
