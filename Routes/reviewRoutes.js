const express = require('express');
// const userController = require("../Controllers/userController.js");
const authentication = require('../Middlewares/authentication.js');
const reviewsController = require('../Controllers/reviewsController.js');
const reviewAuth = require('../Middlewares/reviewAuth.js');

const reviewRouter = express.Router();

reviewRouter.post("/post-review",authentication, reviewsController.postReview);
reviewRouter.post("/get-reviews",reviewAuth, reviewsController.getReviews);
reviewRouter.post('/get-reviewBarData',reviewsController.getReviewBarData);
reviewRouter.post('/check-topReview',reviewAuth,reviewsController.checkTopReview);


module.exports = reviewRouter;