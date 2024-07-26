const Review = require("../Models/Review");

const reviewsController = {
  postReview: async (req, res, next) => {
    try {
      console.log("user:- ", req.user);
      let lastReview = await Review.find({
        carId: req.body.carId,
        userId: req.user._id,
      });
      if (lastReview.length > 0) {
        let newError = {
          message: "you have already added a review",
          review: lastReview[0],
          status: 401,
        };
        throw newError;
      }
      let newReview = new Review();
      newReview.carId = req.body.carId;
      newReview.reviewdBy = req.user._id;
      newReview.rating = req.body.carRating;
      newReview.reviewText = req.body.carReviewText;
      newReview.createdAt = Date.now();
      let savedReview = await newReview.save();
      if (!savedReview) {
        let newError = {
          message: "some technichal error",
          review: lastReview[0],
          status: 500,
        };
        throw newError;
      }

      return res.status(201).json({
        message: "review posted",
        reviewData: savedReview,
      });
    } catch (err) {
      console.log("error while creating review", err);
      let status = err.status || 500;
      return res.status(status).json({
        message: "server error",
        err: err,
      });
    }
  },
  getReviews: async (req, res, next) => {
    let topReview = [];
    let topReviewExist = false;
    console.log('user', req.user);
    if (req.user) {
      let userId = req.user._id;
      console.log("req user", req.user);
      let topReviewResult = await Review.find({
        reviewdBy: userId,
        carId: req.body.carId,
      }).populate({ path: "reviewdBy", select: "firstName lastName" });
      if (topReviewResult.length > 0) {
        topReview = topReviewResult;
      }
      console.log("top Review Result:-", topReview);
    }
    let page = req.body.page;
    console.log("page:- ", page);
    let itemsPerPage = 5;
    let count = await Review.find({
      carId: req.body.carId,
    }).countDocuments();
    let reviews = await Review.find({
      carId: req.body.carId,
    })
      .skip(itemsPerPage * (page - 1))
      .limit(itemsPerPage)
      .populate({ path: "reviewdBy", select: "firstName lastName" });
    if (reviews.length > 0) {
      console.log("reviews", reviews);
      // const compareObjects = (obj1, obj2) => {
      //     // Your comparison logic here
      //     // Example: Compare by a specific property
      //     return obj1._id == obj2._id;
      // };
      let mergedReviews = [...topReview, ...reviews];
      let uniquemergedReviews = [];
      let uniqueReview = {};
      // mergedReviews.forEach((el)=>{

      //     if(!uniquemergedReviews.includes(el)){
      //         uniquemergedReviews.push(el);
      //     }
      // })
      // mergedReviews = mergedReviews.filter((item, index, arr) => {
      //     return arr.findIndex(obj => compareObjects(obj, item)) === index;
      // });
      for (let i in mergedReviews) {
        let reviewId = mergedReviews[i]["_id"];

        uniqueReview[reviewId] = mergedReviews[i];
      }
      for (i in uniqueReview) {
        uniquemergedReviews.push(uniqueReview[i]);
      }
      if (topReview.length != 0) {
        topReviewExist = true;
      }
      console.log("unique merged Reviews", uniquemergedReviews);
      console.log('Response:- ',res)
      return res.status(200).json({
        message: "reviews fetched successfully.",
        reviews: uniquemergedReviews,
        count: count,
        topReviewExist,
      });
    } else {
      return res.status(200).json({
        message: "No reviews",
        reviews: [],
        count: count,
      });
    }
  },
  getReviewBarData: async (req, res, next) => {
    try {
      let oneStarReviews = await Review.find({
        carId: req.body.carId,
        rating: 1,
      }).countDocuments();
      let twoStarReviews = await Review.find({
        carId: req.body.carId,
        rating: 2,
      }).countDocuments();
      let threeStarReviews = await Review.find({
        carId: req.body.carId,
        rating: 3,
      }).countDocuments();
      let fourStarReviews = await Review.find({
        carId: req.body.carId,
        rating: 4,
      }).countDocuments();
      let fiveStarReviews = await Review.find({
        carId: req.body.carId,
        rating: 5,
      }).countDocuments();
      let allReviews = {
        1: oneStarReviews,
        2: twoStarReviews,
        3: threeStarReviews,
        4: fourStarReviews,
        5: fiveStarReviews,
      };
      return res.status(200).json({
        message: "reviews retreived successfully.",
        allReviews,
      });
    } catch (err) {
      return res.status(500).json({
        message: "some server error occured.",
        err: err.message,
      });
    }
  },
  checkTopReview: async (req, res, next) => {
    let carId = req.body.carId;
    let userId = req.user._id;
    let topReview = await Review.find({
      reviewdBy: userId,
      carId: carId,
    });

    if (topReview.length > 0) {
      return res.status(200).json({
        message: "top reviews retrieved",
        topReviewExist: true,
      });
    }

    return res.status(200).json({
      message: "no top review exist",
      topReviewExist: false,
    });
  },
};

module.exports = reviewsController;
