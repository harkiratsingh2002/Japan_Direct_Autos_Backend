const express = require('express');
const carController = require('../Controllers/carController');
// const userController = require("../Controllers/userController.js");

const carRouter = express.Router();

// userRouter.post("/profile-setup", userController.profileSetup);
// userRouter.post('/login',userController.login)
//userRouter.post("/login", userController.login);

carRouter.post('/get-new-cars',carController.getNewCars)
carRouter.post('/get-used-cars',carController.getUsedCars)
carRouter.post('/get-car',carController.getCar)
carRouter.get('/get-seven-new-cars',carController.getSevenNewCars)
carRouter.get('/get-seven-used-cars',carController.getSevenUsedCars)
carRouter.post('/get-five-cars',carController.getFiveCars)
carRouter.post('/delete-car',carController.deleteCar)
carRouter.post('/search-cars',carController.searchCars)






// edited router

module.exports = carRouter;