const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

// Load User Model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      } else {
         const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: req.body.avatar,
          password: req.body.password
        });
         bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                return res.status(500).json({ err: 'Looks Like An Error' });
            }
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find User By Email
    User.findOne({ email }).then(user => {
        // Check for User
        if (!user) {
            return res.status(404).json({ email: 'User Not Found'});
        }

        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                res.json({ msg: 'Success'});
                // Create JWT Payload
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                return res.status(400).json({ password: 'Password Incorrect' });
            }
        });
    });
});

module.exports = router;