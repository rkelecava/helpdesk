var mongoose = require('mongoose');
var crypto = require('crypto');

/* Create a new mongoose schema for our Setup model */
var SetupSchema = new mongoose.Schema({
	name: {type: String, unique: true},
	isComplete: {type: Boolean, default: true},
	companyName: String,
	smtpServer: String,
	smtpUser: String,
	smtpPw: String
});

/* Add new methods to our schema for encrypting and decrypting
the smtp server password using the built-in 'crypto' library in Nodejs */

SetupSchema.methods.encrypt = function (password) {
  var cipher = crypto.createCipher('aes-256-ctr', process.env['JWT_SECRET']);
  var crypted = cipher.update(password,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

SetupSchema.methods.decrypt = function () {
  var decipher = crypto.createDecipher('aes-256-ctr', process.env['JWT_SECRET']);
  var dec = decipher.update(this.smtpPw,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
};

/* Create new Setup model using the SetupSchema we just created above */
mongoose.model('Setup', SetupSchema);