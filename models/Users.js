var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

/* Create a new mongoose schema for our Users model */
var UserSchema = new mongoose.Schema({
	first: String,
	last: String,
	email: String,
	jobTitle: String,
	phoneNumber: String,
	phoneExt: String,
	username: {type: String, lowercase: true, unique: true},
	roles: {type: [String], default: 'guest' },
	isSiteAdmin: {type: Boolean, default: false},
	salt: String,
	hash: String
});

/* Add new methods to our schema for setting and validating
a user's password using the built-in 'crypto' library in Nodejs */
UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

	return this.hash === hash;
};


/* Add a function to generate a new JWT(jsonwebtoken) for an authenticated
user.  The JWT will include the user's username, id, and roles in
the payload.  */
UserSchema.methods.generateJWT = function () {

	// set expiration to 2 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 2);

	/* jwt needs to be signed with a secret key.  This is best set in an environment variable,
	but we can fake this in our test environment by setting the environment variable in 
	env.js and calling it if there is no system environment variable found.  Make sure to add env.js
	to the .gitignore file */
	return jwt.sign({
		_id: this._id,
		name: this.first+' '+this.last,
		jobTitle: this.jobTitle,
		phoneNumber: this.phoneNumber,
		phoneExt: this.phoneExt,
		email: this.email,
		username: this.username,
		roles: this.roles,
		isSiteAdmin: this.isSiteAdmin,
		exp: parseInt(exp.getTime() / 1000),
	}, process.env.JWT_SECRET);
};


UserSchema.methods.sendMailAdmin = function (setup, pw, mail) {

	var transporter = nodemailer.createTransport('smtp://'+setup.smtpUser+':'+pw+'@'+setup.smtpServer);

	// setup e-mail data with unicode symbols
	var mailOptions = {
    	from: setup.companyName+' Helpdesk <'+setup.smtpUser+'>', // sender address
    	to: mail[0].to, // list of receivers
    	subject: mail[0].subject, // Subject line
    	text: mail[0].plainText, // plaintext body
    	html: '<a href="http://localhost:3000/#/confirm/'+this._id+'/confirm">Confirm</a> OR <a href="http://localhost:3000/#/deny/'+this._id+'/deny">Deny</a>' // html body
	//	html: '<a href="http://localhost:3000/#/home">Confirm or Deny</a>'
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
    	if(error){
        	return console.log(error);
    	}
    	console.log('Message sent: ' + info.response);
	});
};


UserSchema.methods.sendMail = function (setup, pw, mail) {

	var transporter = nodemailer.createTransport('smtp://'+setup.smtpUser+':'+pw+'@'+setup.smtpServer);

	// setup e-mail data with unicode symbols
	var mailOptions = {
    	from: setup.companyName+' Helpdesk <'+setup.smtpUser+'>', // sender address
    	to: mail[0].to, // list of receivers
    	subject: mail[0].subject, // Subject line
    	text: mail[0].plainText, // plaintext body
    	html: mail[0].html // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
    	if(error){
        	return console.log(error);
    	}
    	console.log('Message sent: ' + info.response);
	});
};


/* Create new User model using the UserSchema we just created above */
mongoose.model('User', UserSchema);


