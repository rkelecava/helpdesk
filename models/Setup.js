var mongoose = require('mongoose');
var crypto = require('crypto');

/* Create a new mongoose schema for our Setup model */
var SetupSchema = new mongoose.Schema({
	name: {type: String, unique: true},
	isComplete: {type: Boolean, default: true},
	smtpServer: String,
	smtpUser: String,
	smtpPwHash: String,
	smtpPwSalt: String
});

/* Add new methods to our schema for setting and validating
the smtp server password using the built-in 'crypto' library in Nodejs */
SetupSchema.methods.setPassword = function (password) {
	this.smtpPwSalt = crypto.randomBytes(16).toString('hex');

	this.smtpPwHash = crypto.pbkdf2Sync(password, this.smtpPwSalt, 1000, 64).toString('hex');
};

SetupSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.smtpPwSalt, 1000, 64).toString('hex');

	return this.smtpPwHash === hash;
};

/* Create new Setup model using the SetupSchema we just created above */
mongoose.model('Setup', SetupSchema);