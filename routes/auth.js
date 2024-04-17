var express = require('express');
var router = express.Router();
var userModel = require('../models/userModel')
var ResHand = require('../helper/ResHandle')
var { validationResult } = require('express-validator');
var checkAuth = require('../validators/authValidator')
var bcrypt = require('bcrypt');
var protect = require('../middlewares/protect')
var sendMail = require('../helper/sendmail')


router.get('/me', protect, async function (req, res, next) {
  ResHand(res, true, req.user);
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    ResHand(res, false, "Hãy nhập đầy đủ thông tin");
    return;
  }
  let user = await userModel.findOne({ username: username })
  if (!user) {
    ResHand(res, false, "username hoặc password không đúng");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    let token = user.getJWT();
    // Set token in cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 24 * 3600 * 1000),
      httpOnly: true
    });
    // Redirect to home page with username parameter
    res.redirect('/?username=' + user.username);
  } else {
    ResHand(res, false, "username hoặc password không đúng");
  }
});

router.get('/logout', (req, res) => {
  //res.render('logout');
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

router.get('/profile', protect, async function(req, res, next) {
  try {
    const user = req.user;
    res.render('profile', { user: user });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/profile', protect, async function(req, res, next) {
  try {
      const userId = req.user._id;
      const updatedUserInfo = {
          username: req.body.username,
          email: req.body.email
      };
      const updatedUser = await userModel.findByIdAndUpdate(userId, updatedUserInfo, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: "Không tìm thấy người dùng để cập nhật" });
      }
      res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi cập nhật thông tin người dùng" });
  }
});


router.get('/me', protect, async function (req, res, next) {
  ResHand(res, true, req.user);
});


router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', checkAuth(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHand(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ["USER"]
    })
    await newUser.save();
    //res.status(200).send(newUser);
    res.redirect('/auth/login');
  } catch (error) {
    res.status(404).send(error);
  }
});

router.get('/ResetPassword/:token', (req, res) => {
  res.render('ResetPassword', { token: req.params.token });
});

router.post('/ResetPassword/:token', async function (req, res, next) {  
  let user = await userModel.findOne({
    ResetPasswordToken:
      req.params.token
  });
  if (!user) {
    res.status(404).send("URL không hợp lệ");
    return;
  }
  user.password = req.body.password;
  user.ResetPasswordToken = undefined;
  user.ResetPasswordExp = undefined;
  await user.save();
  res.status(200).send("Đổi pass thành công");
});

router.get('/ForgotPassword', (req, res) => {
  res.render('ForgotPassword');
});

router.post('/ForgotPassword', async function (req, res, next) {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).send("Email không tồn tại");
    return;
  }
  let token = user.genTokenResetPassword();
  await user.save();
  let url = `http://localhost:3000/auth/ResetPassword/${token}`
  try {
    await sendMail(user.email, url);
    res.status(200).send("Gửi mail thành công");
  } catch (error) {
    res.status(404).send(error);
  }
});

router.get('/ChangePassword', (req, res) => {
  res.render('ChangePassword');
});
router.post('/changepassword', protect, async function (req, res, next) {
  try {
    if (bcrypt.compareSync(req.body.oldpassword, req.user.password)) {
      let user = req.user;
      user.password = req.body.newpassword;
      await user.save();
      ResHand(res, true, "Cập nhật mật khẩu thành công");
    } else {
      ResHand(res, false, "Mật khẩu cũ không đúng");
    }
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error);
    ResHand(res, false, "Đã xảy ra lỗi khi thay đổi mật khẩu");
  }
});

module.exports = router;