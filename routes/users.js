var express = require('express');
var router = express.Router();

/*Require mongoose, so that our routes can access our db */
var mongoose = require('mongoose');

/* Require passport and express-jwt for authentication */
var passport = require('passport');
var jwt = require('express-jwt');

/*Include the User mongoose model that our users routes will be using
to access our db */
var User = mongoose.model('User');

/*Include the Setup mongoose model that our users routes will be using
to access our db */
var Setup = mongoose.model('Setup');

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
/* GET all users. */
/*********************/
router.get('/', auth, checkAdmin, function(req, res, next) {
	// Query db using mongoose find method
	User.find( function (err, users) {
		// Return any errors
		if (err) { return next(err); }
		// If there are no errors, return the list of users
		return res.json(users);
	});
});

/********************/
/* POST a new user */
/********************/
router.post('/', auth, checkAdmin, function (req, res, next) {
	// Check for required fields
	if (!req.body.username || req.body.username === '') {
		return res.status(400).json({
			message: 'You must enter a valid username'
		});
	}

	if (!req.body.password || req.body.password === '') {
		return res.status(400).json({
			message: 'You must enter a valid password'
		});
	}

	if (!req.body.email || req.body.email === '') {
		return res.status(400).json({
			message: 'You must enter a valid e-mail address'
		});
	}

	// Define a new user model
	var user = new User();

	// Set username = username from form
	user.username = req.body.username;

	// Set password = encrypt password from form using setPassword method defined in User schema
	user.setPassword(req.body.password);

	// Set first = first from form
	user.first = req.body.first;

	// Set last = last from form
	user.last = req.body.last;

	// Set jobTitle = jobTitle from form
	user.jobTitle = req.body.jobTitle;

	// Set phoneNumber = phoneNumber from form
	user.phoneNumber = req.body.phoneNumber;

	// Set phoneExt = phoneExt from form
	user.phoneExt = req.body.phoneExt;

	// Set email = email from form
	user.email = req.body.email;

	// Add role from form to user roles array
	if (req.body.role) { user.roles.push(req.body.role); }

	// Save user to db using mongoose save method
	user.save(function (err) {
		// Return any errors
		if (err) { return next(err); }

		/* If no errors, generate a new JWT(jsonwebtoken) for the
		newly added user using the generateJWT method defined in the User Schema */
		return res.json({token: user.generateJWT()});
	});
});

/*****************************************
/* Middleware to PRELOAD "User" Object.
Define a new route parameter for :user */
/******************************************/
router.param('user', function (req, res, next, id) {

	// Define a new query to search for user by ID
	var query = User.findById(id);

	// Execute the query
	query.exec(function (err, user) {
		// Return any errors
		if (err) { return next(err); }
		// If no user is found with given ID, return error
		if (!user) { return next(new Error('can\'t find user')); }

		// If no errors, set req.user = to user from db
		req.user = user;
		return next();
	});
});

/*********************************/
/* GET a single user by _id */
/*********************************/
router.get('/:user', auth, checkAdmin, function (req, res, next) {

	// Return the user from the route parameter
	return res.json(req.user);
});


/**************************/
/* DELETE a user */
/**************************/
router.delete('/:user', auth, checkAdmin, function (req, res, next) {

	// Remove user using mongoose remove method
	req.user.remove(function (err, user) {
		// Return any errors
		if (err) { return next(err); }

		// Query db using mongoose find method
		User.find( function (err, users) {
			// Return any errors
			if (err) { return next(err); }
			// If there are no errors, return the list of users
			return res.json(users);
		});
	});
});

/************************/
/* UPDATE a user */
/************************/
router.put('/:user', auth, checkAdmin, function (req, res, next) {

	User.findById(req.user._id, function (err, user) {

		// Update username if set in form
		if (req.body.username) { user.username = req.body.username; }

		// Update password if set in form
		if (req.body.password) { user.setPassword(req.body.password); }

		// Update first if set in form
		if (req.body.first) { user.first = req.body.first; }

		// Update last if set in form
		if (req.body.last) { user.last = req.body.last; }

		// Update e-mail if set in form
		if (req.body.email) { user.email = req.body.email; }

		// Update jobTitle if set in form
		if (req.body.jobTitle) { user.jobTitle = req.body.jobTitle; }

		// Update phoneNumber if set in form
		if (req.body.phoneNumber) { user.phoneNumber = req.body.phoneNumber; }

		// Update phoneExt if set in form
		if (req.body.phoneExt) { user.phoneExt = req.body.phoneExt; }

		// Add role if set in form
		if (req.body.role && user.roles.indexOf(req.body.role) == -1) { user.roles.push(req.body.role); }

		// Save changes to user using the mongoose save method
		user.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({token: user.generateJWT()});
		});
	});
});

/************************/
/* GET a user's roles */
/*******************************/
router.get('/:user/roles', function (req, res, next) {

	// Return the user from the route parameter
	return res.json(req.user.roles);
});

/*************************/
/* Revoke a role from a user */
/*******************************/
router.put('/:user/roles', auth, checkAdmin, function (req, res, next) {

	User.findById(req.user._id, function (err, user) {

		// Add role if set in form
		if (req.body.removeRole == 'yes' && req.body.role) { 
			var index = user.roles.indexOf(req.body.role);
			user.roles.splice(index, 1);
		}

		// Save changes to user using the mongoose save method
		user.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({token: user.generateJWT()});
		});
	});
});

/************************/
/* Confirm the newly registered user */
/*******************************/
router.put('/:user/confirm', auth, checkAdmin, function (req, res, next) {

	User.findById(req.user._id, function (err, user) {

		// Confirm user access
		if (user.roles.indexOf('user') == -1) { user.roles.push('user'); }

		var setup = new Setup();

		var mail = Array({
			to: user.email,
			subject: 'Registration confirmed',
			plainText: 'You have been granted access to submit new helpdesk requests online.',
			html: 'You have been granted access to submit new helpdesk requests online.'
		});

		// Save changes to user using the mongoose save method
		user.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			Setup.findOne({name: 'main'}, function (err, setup) {
				if (err) { return next(err); }

				var pw = setup.decrypt();

				user.sendMail(setup, pw, mail);
			});

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({message: user.first+' '+user.last+' has been confirmed'});
		});
	});

});

/************************/
/* Route to login a user */
/**************************/
router.post('/login', function (req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({
			message: 'Please fill out all required fields'
		});
	}

	passport.authenticate('local', function (err, user, info) {
		if (err) { return next(err); }

		if (user) {
			return res.json({
				token: user.generateJWT()
			});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

/*************************/
/*Route to register a new user*/
/*************************/
router.post('/register', function (req, res, next) {
	if (!req.body.username || !req.body.password || !req.body.email) {
		return res.status(400).json({
			message: 'Please fill out all required fields'
		});
	}

	var user = new User();

	var setup = new Setup();



	var mail = Array({
		to: 'rkelecava@scottelectricusa.com',
		subject: 'New Registration: '+req.body.first+' '+req.body.last,
		plainText: 'Please confirm or deny this user\'s access to the system.'
	});

	user.username = req.body.username;
	user.first = req.body.first;
	user.last = req.body.last;
	user.email = req.body.email;
	user.jobTitle = req.body.jobTitle;
	user.phoneNumber = req.body.phoneNumber;
	user.phoneExt = req.body.phoneExt;

	user.setPassword(req.body.password);

	user.save(function (err) {
		if (err) { return next(err); }

		Setup.findOne({name: 'main'}, function (err, setup) {
			if (err) { return next(err); }

			var pw = setup.decrypt();

			user.sendMailAdmin(setup, pw, mail);
		});

		return res.json({token: user.generateJWT()});
	});
});

/**************************/
/* End of Routes */
/**************************/

module.exports = router;

