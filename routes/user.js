var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel')
var ResHand = require('../helper/ResHandle')
var { validationResult } = require('express-validator');
var checkUser = require('../validators/userValidator')
var protect = require('../middlewares/protect')
var checkrole = require('../middlewares/checkrole')

router.get('/', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  let users = await userModel.find({}).exec();
  ResHand(res, true, users);
});

router.get('/:id', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  try {
    let user = await userModel.find({ _id: req.params.id }).exec();
    ResHand(res, true, user);
  } catch (error) {
    ResHand(res, false, error);
  }
});

router.post('/', checkUser(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHand(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    })
    await newUser.save();
    res.status(200).send(newUser);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    let user = await userModel.findById
      (req.params.id).exec()
    user.email = req.body.email;
    await user.save()
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send(error);
  }
});


router.delete('/:id', async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndUpdate
      (req.params.id, {
        status: false
      }, {
        new: true
      }).exec()
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;