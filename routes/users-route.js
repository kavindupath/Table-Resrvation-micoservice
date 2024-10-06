const express = require ("express");
const router = express.Router();
const {check} = require('express-validator');

const usersContollers=require('../controllers/users-controllers')

router.get('/',usersContollers.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),

    check("email").normalizeEmail().isEmail(), //Test@gmail.com==> test@gmail.com

    check("password").isLength({ min: 6 }),
  ],usersContollers.signup
);

router.post('/login',usersContollers.login);

module.exports=router;
