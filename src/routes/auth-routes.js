const express = require('express');
const { RegisterInput, LoginInput } = require('../utils/validators');
const { registerUser, loginUser } = require('../services/user-service');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const parsed = RegisterInput.parse(req.body);
    const user = await registerUser(parsed);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginInput.parse(req.body);
    const result = await loginUser(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
