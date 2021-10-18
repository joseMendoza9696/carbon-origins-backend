const express = require('express');
const router = new express.Router();
const User = require('../models/user');

router.post('/signup', async (req, res) => {
	try {
		const userExists = await User.exists({ email: req.body.email });
		if (userExists) {
			throw new Error('Account already exists');
		}
		const user = new User({
			...req.body,
		});
		await user.save();
		const token = await user.generateAuthToken();

		res.status(201).send({ token });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

router.post('/signin', async (req, res) => {
	try {
		const user = await User.findByEmailPassword(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();

		res.status(200).send({ token });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

module.exports = router;
