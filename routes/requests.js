var express = require('express');
var router = express.Router();

/*Require mongoose, so that our routes can access our db */
var mongoose = require('mongoose');

/* Require passport and express-jwt for authentication */
var passport = require('passport');
var jwt = require('express-jwt');

/*Include the Request mongoose model that our requests routes will be using
to access our db */
var Request = mongoose.model('Request');

/****************************/
/* Middleware */
/*****************************/

// Middleware to check for authenticated JWT and get the payload
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});

// Middleware to check if a user has admin permissions
var checkAdmin = function (req, res, next) {

	/* Loop through the user roles from the JWT payload 
	if 'admin' role is found, continuing moving forward.
		If not, return error w/ status 401 */
	for (var i=0; i<req.payload.roles.length; i++) {
		if (req.payload.roles[i]=='admin') {
			return next();
		}
	}

	var err = new Error('You do not have the required permissions to access this route');
	err.status = 401;
	return next(err);
};

// Middleware to check if a user has user permissions
var checkUser = function (req, res, next) {

	/* Loop through the user roles from the JWT payload 
	if 'user' or 'admin' role is found, continuing moving forward.
		If not, return error w/ status 401 */
	for (var i=0; i<req.payload.roles.length; i++) {
		if (req.payload.roles[i]=='admin' || req.payload.roles[i]=='user') {
			return next();
		}
	}

	var err = new Error('You do not have the required permissions to access this route');
	err.status = 401;
	return next(err);
};

/************************/
/* End of Middleware */
/************************/

/************************/
/* Routes */
/************************/

/*********************/
/* GET all help requests. Need a minimum of 'admin' level permissions */
/*********************/
router.get('/', auth, checkAdmin, function(req, res, next) {
	// Query db using mongoose find method
	Request.find( function (err, requests) {
		// Return any errors
		if (err) { return next(err); }
		// If there are no errors, return the list of users
		return res.json(requests);
	});
});

/********************/
/* POST a new help request.  Need a mininum of 'user' level permissions */
/********************/
router.post('/', auth, checkUser, function (req, res, next) {
	// Check for required fields
	if (!req.body.requestText || req.body.requestText === '') {
		return res.status(400).json({
			message: 'You cannot submit a blank request'
		});
	}

	// Define a new request model
	var request = new Request();

	// Set requestText = requestText from form
	request.requestText = req.body.requestText;

	// Set requestedBy = requestedBy from form
	request.requestedBy = req.body.requestedBy;

	// Set priority = priority from form
	if (req.body.priority) { request.priority = req.body.priority; }

	// Set assignedTo = assignedTo from form
	request.assignedTo = req.body.assignedTo;

	// Save request to db using mongoose save method
	request.save(function (err, request) {
		// Return any errors
		if (err) { return next(err); }

		/* If no errors, return the current request */
		return res.json(request);
	});
});


/**************************/
/* End of Routes */
/**************************/



module.exports = router;
