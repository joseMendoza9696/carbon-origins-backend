const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid');
			}
		},
	},
	password: {
		type: String,
		required: true,
	},
});

userSchema.statics.findByEmailPassword = async (email, password) => {
	const userExists = await User.findOne({ email });
	if (!userExists) {
		throw new Error('Incorrect email or password');
	}
	const isMatch = await bcrypt.compare(password, userExists.password);
	if (!isMatch) {
		throw new Error('Incorrect email or password');
	}
	return userExists;
};

userSchema.methods.generateAuthToken = function () {
	const user = this;
	const token = jwt.sign(
		{ _id: user._id.toString(), email: user.email },
		process.env.JWT_SECRET
	);

	return token;
};

userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
