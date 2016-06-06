var express = require('express');
var router = express.Router();

/*Require mongoose, so that our routes can access our db */
var mongoose = require('mongoose');

/*Include the User mongoose model that our users routes will be using
to access our db */
var User = mongoose.model('User');

/*Include the Setup mongoose model that our setup routes will be using
to access our db */
var Setup = mongoose.model('Setup');

/*********************/
/* GET the setup information. */
/*********************/
router.get('/', function(req, res, next) {
	// Query db using mongoose find method
	Setup.find( function (err, setups) {
		// Return any errors
		if (err) { return next(err); }
		// If there are no errors, return the list of setup info
		return res.json(setups);
	});
});

/********************/
/* POST a setup */
/********************/
router.post('/', function (req, res, next) {
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


	if (!req.body.smtpServer || req.body.smtpServer === '') {
		return res.status(400).json({
			message: 'You must enter a valid smtp server address'
		});
	}

	if (!req.body.smtpUser || req.body.smtpUser === '') {
		return res.status(400).json({
			message: 'You must enter a valid smtp server username'
		});
	}

	if (!req.body.smtpPw || req.body.smtpPw === '') {
		return res.status(400).json({
			message: 'You must enter a valid smtp server pw'
		});
	}

	// Define a new setup model
	var setup = new Setup();

	// Define a new user model
	var user = new User();

	// Set username = username from form
	user.username = req.body.username;

	// Set password = encrypt password from form using setPassword method defined in User schema
	user.setPassword(req.body.password);

	// Set email = email from form
	user.email = req.body.email;

	// Set first = first from form
	user.first = req.body.first;

	// Set last = last from form
	user.last = req.body.last;

	// Add the admin role to user roles array
	user.roles.push('admin');

	// Set the name of the setup config, so that we can check for unique
	setup.name = 'main';

	// Set the flag to mark the setup as being completed
	setup.isComplete = true;

	// Set smtpServer = smtpServer from form
	setup.smtpServer = req.body.smtpServer;

	// Set smtpUser = smtpUser from form
	setup.smtpUser = req.body.smtpUser;

	// Set smtpPw = smtpPw from form
	setup.smtpPw = req.body.smtpPw;

	setup.save(function (err) {
		// Return any errors
		if (err) { return next(err); }

		// if no errors with saving the setup, save the admin user
		user.save(function (err) {
			if (err) { return next(err); }

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({token: user.generateJWT()});
		});
	});

});

/*****************************************
/* Middleware to PRELOAD "Setup" Object.
Define a new route parameter for :setup */
/******************************************/
router.param('setup', function (req, res, next, id) {

	// Define a new query to search for setup by ID
	var query = Setup.findById(id);

	// Execute the query
	query.exec(function (err, setup) {
		// Return any errors
		if (err) { return next(err); }
		// If no setup is found with given ID, return error
		if (!setup) { return next(new Error('can\'t find any setup')); }

		// If no errors, set req.setup = to setup from db
		req.setup = setup;
		return next();
	});
});

/*********************************/
/* GET a single setup by _id */
/*********************************/
router.get('/:setup', function (req, res, next) {

	// Return the setup from the route parameter
	return res.json(req.setup);
});


/**************************/
/* DELETE a setup */
/**************************/
router.delete('/:setup', function (req, res, next) {

	// Remove setup using mongoose remove method
	req.setup.remove(function (err, setup) {
		// Return any errors
		if (err) { return next(err); }

		// If no errors, return a message stating that the setup has been removed
		res.json({message: 'Setup removed'});
	});
});


/************************/
/* UPDATE a setup */
/************************/
router.put('/:setup', function (req, res, next) {

	Setup.findById(req.setup._id, function (err, setup) {

		// Update smtpServer if set in form
		if (req.body.smtpServer) { setup.smtpServer = req.body.smtpServer; }

		// Update smtpUser if set in form
		if (req.body.smtpUser) { setup.smtpUser = req.body.smtpUser; }

		// Update smtpPw if set in form
		if (req.body.smtpPw) { setup.setPassword(req.body.smtpPw); }


		// Save changes to setup using the mongoose save method
		setup.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			return res.json(setup);
		});
	});
});




module.exports = router;