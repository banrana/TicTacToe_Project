const express = require('express');
const router = express.Router();
const protect = require('../middlewares/protect'); 

// Route cho trang chính
router.get('/', protect, function(req, res, next) {
  res.render('index', { username: req.query.username });
});

router.use('/auth', require('./auth'));
router.use('/game', require('./game'));
router.use('/user', require('./user'));
router.use('/room', require('./room'));
router.use('/chat', require('./chat'));
module.exports = router;
