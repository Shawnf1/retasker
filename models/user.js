
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var jsonwebtoken = require('jsonwebtoken');
var SALT_WORK_FACTOR = 10;
var TaskSchema = require('./task.js').Schema;
var NoteSchema = require('./note.js').Schema;
var TagSchema = require('./tag.js').Schema;

var UserSchema = new Schema({
	username: {type: String, required: true, index: {unique: true}},
	password: {type: String, required: true},
	email: {type: String, required: true, index: {unique: true}},
	first_name: String,
	last_name: String,
	created_on: Date,
	last_access: Date,
	locked_out: {type: Boolean, default: false},
	tasks: [TaskSchema],
	notes: [NoteSchema],
	tags: [TagSchema]
});

UserSchema.pre('save', function (next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) {
		return next();
	}

	if(!user.created_on) {
		user.created_on = new Date();
	}

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}

		// hash the password along with our new salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};
/**
 * Statics
 */

UserSchema.statics.getAuthenticated = function (user, callback) {
	console.log('getAuthenticated', user);
	this.findOne({username: user.username}, function (err, doc) {
		if (err) {
			console.log(err);
			return callback(err);
		} else if (!doc) {// make sure the user exists
			console.log('No user found,');
			return callback(new Error('Invalid username or password.', 401), null);
		} else {// user exists, no errors

			// test for a matching password
			doc.comparePassword(user.password, function (err, isMatch) {
				if (err) {
					console.log(err);
					return callback(err);
				}

				// check if the password was a match
				if (isMatch) {
					var user = {
						username: doc.username,
						id: doc._id,
						created_on: doc.created_on,
						email: doc.email,
						locked_out: doc.locked_out,
						first_name: doc.first_name,
						last_name: doc.last_name
					};

					// return the jwt
					var token = jsonwebtoken.sign(user, 'kindaSecret', {
						expiresInMinutes: 1440 // expires in 24 hours
					});
					return callback(null, token, user);
				}
				else {
					return callback(new Error('Invalid username or password.'), null);

				}
			});
		}
	});
};


UserSchema.statics.Create = function (user, callback) {
	var self = this;
	// first check that passwords match before continuing
	if(user.password != user.password_confirm) {
		return callback(new Error('Passwords do not match.'), null);
	}
	// second check that emails match
	if(user.email != user.email_confirm) {
		return callback(new Error('Emails do not match.'), null);
	}
	// find a user in Mongo with provided username
	this.findOne({'username': user.username}, function (err, doc) {
		// In case of any error return
		if (err) {
			return callback(err);
		}
		// username already exists
		if (doc) {
			console.log("Username exists");
			return callback(new Error('Username Already Exists'), null);
		}else {

			// find a user in Mongo with provided email
			self.findOne({'email': user.email}, function (err, doc) {
				if(err) {
					console.log("err", err);
					return callback(err);
				}
				// if email exists
				if(doc) {
					console.log("Email exists");
					return callback(new Error('Email Already Exists'), null);
				}else{
					//console.log("checking failed, got to end", doc);
					// if there is no user with that username
					// create the user
					var User =  mongoose.model('User', UserSchema);
					var newUser = new User({
						password: user.password,
						username: user.username,
						email: user.email,
						first_name: user.first_name,
						last_name: user.last_name
					});

					// save the user
					newUser.save(function (err) {
						// In case of any error, return using the done method
						if (err) {
							return callback(err);
						}
						// User Registration successful
						return callback(null, newUser);
					});
				}
			});
		}
	});

};
//module.exports = mongoose.model('User', UserSchema);
module.exports.Model = mongoose.model('User', UserSchema);
module.exports.Schema = UserSchema;