const express = require('express');
const userController = require("../Controllers/userController.js");
const authentication = require('../Middlewares/authentication.js');

const userRouter = express.Router();

userRouter.post("/add-admin", userController.addAdmin);
userRouter.post("/signup-customer", userController.signupUser);
userRouter.post("/login-customer", userController.loginUser);
userRouter.post("/check-admin",authentication, userController.checkAdmin);
userRouter.post("/sign-up-google",userController.signUpGoogle)
userRouter.post("/add-user-admin",authentication,userController.addUserAdmin);
userRouter.post("/get-five-users",userController.getFiveUsers);
userRouter.post("/get-user-data",userController.getUserData);
userRouter.post("/edit-user-admin",authentication,userController.editUserAdmin);
userRouter.post("/search-user",userController.searchUser);
userRouter.post("/search-user-by-email",userController.searchUserByEmail);
userRouter.post('/delete-user',userController.deleteUser)
userRouter.post('/forgot-password',userController.forgotPassword)
userRouter.post('/change-password',userController.changePassword)
userRouter.post('/get-user',authentication,userController.getUser)
userRouter.post('/update-user',userController.updateUser)













// userRouter.post('/login',userController.login)
//userRouter.post("/login", userController.login);

// edited router

module.exports = userRouter;