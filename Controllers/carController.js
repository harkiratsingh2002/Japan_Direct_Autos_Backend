const sendgridTransport = require("nodemailer-sendgrid-transport");
const Car = require("../Models/Car");
const User = require("../Models/User");

const nodemailer = require("nodemailer");
const nodemailerTransport = require("nodemailer-sendgrid-transport");
const fs = require("fs");
const AdminCarInfo = require("../Models/AdminCarInfo");

const carController = {

  getNewCars: async (req, res, next) => {
    let page = req.body.page;
    let itemsPerPage = 6;
    let count = await Car.find({
      oldOrNew: "New",
    }).countDocuments();
    let cars = await Car.find({
      oldOrNew: "New",
    })
      .skip(itemsPerPage * (page - 1))
      .limit(itemsPerPage);
    console.log("All new cars:- ", cars);
    res.status(200).json({
      message: "All new Cars",
      cars: cars,
      count: count,
    });
  },
  getUsedCars: async (req, res, next) => {
    let page = req.body.page;
    console.log("page:-", page);
    let itemsPerPage = 6;
    let count = await Car.find({
      oldOrNew: "Used",
    }).countDocuments();
    let cars = await Car.find({
      oldOrNew: "Used",
    })
      .skip(itemsPerPage * (page - 1))
      .limit(itemsPerPage);
    console.log("All Used cars:- ", cars);
    res.status(200).json({
      message: "All Used Cars",
      cars: cars,
      count: count,
    });
  },
  // getUsedCars: async (req, res, next) => {
  //   let cars = await Car.find({
  //     oldOrNew: "Used",
  //   });
  //   console.log("All Used cars:- ", cars);
  //   res.status(200).json({
  //     message: "All Used Cars",
  //     cars: cars,
  //   });
  // },
  getRentalCars: async (req, res, next) => {
    let page = req.body.page;
    console.log("page:-", page);
    let itemsPerPage = 6;
    let count = await Car.find({
      oldOrNew: "Rental",
    }).countDocuments();
    let cars = await Car.find({
      oldOrNew: "Rental",
    })
      .skip(itemsPerPage * (page - 1))
      .limit(itemsPerPage);
    console.log("All Rental cars:- ", cars);
    res.status(200).json({
      message: "All Rental Cars",
      cars: cars,
      count: count,
    });
  },
  getCar: async (req, res, next) => {
    console.log("request reached...!!!");
    try {
      console.log("carId", req.body.carId);
      let car = await Car.findById(req.body.carId);
      console.log("car:-", car);
      if (!car) {
        let newError = {
          message: "Car not found...!!!",
          status: 404,
        };
        throw newError;
      }
      return res.status(200).json({
        message: "car got successfully",
        car: car,
      });
    } catch (err) {
      console.log("error while getting car,:-", err);
      return res.status(500).json({ message: "error while adding car..!!!" });
    }
  },
  addCar: async (req, res, next) => {
    if (!req.files) {
      return res.status(400).json({ message: "No images uploaded." });
      console.log("image adding error");
    }
    try {
      // let user = await User.findOne({ email: req.body.email });
      let user = req.user;
      console.log("user:- ", user);
      if (user.role != "admin") {
        return res.status(401).json({ message: "unauthorized" });
      }
      console.log("user:-", user);
      let adminid = user._id;

      let newCar = new Car();
      let {
        stockId,
        make,
        grade,
        chassisNo,
        odometer,
        model,
        name,
        oldOrNew,
        body,
        year,
        price,
        brand,
        description,
        engine,
        suspension,
        transmission,
        fuelType,
        mileage,
        seatingCapacity,
        color,
      } = req.body;
      newCar.adminId = adminid;
      newCar.stockId = stockId;
      newCar.make = make;
      newCar.grade = grade;
      newCar.chassisNo = chassisNo;
      newCar.odometer = odometer;
      newCar.model = model;
      newCar.name = name;
      newCar.oldOrNew = oldOrNew;
      newCar.body = body;
      newCar.year = year;
      newCar.price = price;
      newCar.brand = brand;
      newCar.description = description;
      newCar.engine = engine;
      newCar.mileage = mileage;
      newCar.suspension = suspension;
      newCar.transmission = transmission;
      newCar.fuelType = fuelType;
      newCar.seatingCapacity = seatingCapacity;
      newCar.color = color;
      let images = [];
      // arr.map((obj)=>{
      //     let p = (req.files[obj.name][0]).path;
      //     images.push(p);
      // })
      console.log("files:- ", req.files);
      req.files.map((file) => {
        console.log("file:- ", file);
        let path = file.filename;
        images.push(path);
      });
      newCar.images = images;
      let savedCar = await newCar.save();
      if (!savedCar._id) {
        let newError = {
          status: 401,
          message: "error while adding car in server",
        };
        throw newError;
      }
      return res
        .status(201)
        .json({ message: "added succefully...!!", carId: savedCar._id });

      // code to send email to subscribers.
    } catch (err) {
      console.log("error while adding car", err);
      return res.status(401).json({
        message: "error while adding car",
      });
    }
  },
  getSevenNewCars: async (req, res, next) => {
    try {
      let sevenNewCars = await Car.find({
        oldOrNew: "New",
      }).limit(7);
      return res.status(200).json({
        cars: sevenNewCars,
      });
    } catch (error) {
      console.log("err while getting 7 cars", error);
    }
  },
  getSevenUsedCars: async (req, res, next) => {
    try {
      let sevenUsedCars = await Car.find({
        oldOrNew: "Used",
      }).limit(7);
      return res.status(200).json({
        cars: sevenUsedCars,
      });
    } catch (error) {
      console.log("err while getting 7 cars", error);
    }
  },
  getSevenRentalCars: async (req, res, next) => {
    try {
      let sevenUsedCars = await Car.find({
        oldOrNew: "Rental",
      }).limit(7);
      return res.status(200).json({
        cars: sevenUsedCars,
      });
    } catch (error) {
      console.log("err while getting 7 cars", error);
    }
  },
  getFiveCars: async (req, res, next) => {
    try {
      let page = req.body.page;
      let total = await Car.find().countDocuments();
      let fiveCars = await Car.find()
        .populate("adminId", "email")
        .skip(5 * (page - 1))
        .limit(5);
      let finalFiveCars = [];
      fiveCars.forEach((car) => {
        let objCar = {};
        objCar.name = car.name;
        objCar.adminEmail = car.adminId;
        objCar.oldOrNew = car.oldOrNew;
        objCar.carId = car._id;
        finalFiveCars.push(objCar);
      });
      return res.status(200).json({
        finalFiveCars: finalFiveCars,
        total,
      });
    } catch (error) {
      console.log("error while getting 5 cars", error);
      return res.status(500).json({
        message: "some server error.",
      });
    }
  },
  deleteCar: async (req, res, next) => {
    try {
      const car = await Car.findById(req.body.carId);
      if (!car) {
        let newError = {
          message: "car not found",
        };
        throw newError;
      }
      car.images.forEach((imgPath) => {
        fs.unlink(imgPath, (err) => {
          if (err) {
            console.error("Failed to delete image file:", err);
          } else {
            console.log("Image file deleted successfully!");
          }
        });
      });
      await Car.findByIdAndDelete(req.body.carId);
      await AdminCarInfo.findOneAndDelete({
        carId: req.body.carId,
      });
      return res.status(201).json({
        message: "Car deleted successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
  searchCars: async (req, res, next) => {
    try {
      const { searchText, page = 1, sortOption } = req.body;

      // Define a regex for partial match (case insensitive) on the 'name' field
      const regex = new RegExp(searchText, "i");

      // Create the query object
      const query = {
        name: { $regex: regex },
      };

      console.log("Search Query: ", JSON.stringify(query));

      // Default sort criteria
      let sortCriteria = {};

      // Modify sortCriteria based on user selection
      if (sortOption === "price_asc") {
        sortCriteria = { price: 1 }; // Sort by price ascending
      } else if (sortOption === "price_desc") {
        sortCriteria = { price: -1 }; // Sort by price descending
      } else if (sortOption === "year_asc") {
        sortCriteria = { year: 1 }; // Sort by year ascending (oldest first)
      } else if (sortOption === "year_desc") {
        sortCriteria = { year: -1 }; // Sort by year descending (newest first)
      }

      console.log("Sort Criteria: ", sortCriteria);

      // Get the total count of documents matching the search
      const total = await Car.find(query).countDocuments();

      console.log("Total search results: ", total);

      // Perform the search with sorting and pagination
      const searchResult = await Car.find(query)
        .populate("adminId", "email")
        .sort(sortCriteria) // Apply sorting criteria
        .skip(5 * (page - 1)) // Pagination skip
        .limit(5) // Limit results per page
        .exec(); // Execute the query

      console.log("Search Result: ", searchResult);

      return res.status(200).json({
        total,
        searchResult,
      });
    } catch (error) {
      console.log("Error while searching Cars", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },


  addAdminCarInfo: async (req, res, next) => {
    try {
      let newAdminInfo = new AdminCarInfo();
      newAdminInfo.carId = req.body.carId;
      newAdminInfo.costPrice = req.body.adminInfo.costPrice;
      newAdminInfo.brokerForwarderHandlingFees =
        req.body.adminInfo.brokerForwarderHandlingFees;
      newAdminInfo.preShipInspection = req.body.adminInfo.preShipInspection;
      newAdminInfo.inlandTransport = req.body.adminInfo.inlandTransport;
      newAdminInfo.freightInsurance = req.body.adminInfo.freightInsurance;
      newAdminInfo.gst = req.body.adminInfo.gst;
      newAdminInfo.customClearance = req.body.adminInfo.customClearance;
      await newAdminInfo.save();
      return res.status(201).json({
        message: "admin info added.",
      });
    } catch (error) {
      console.log("err while adding admin info Car", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getCarAdminInfo: async (req, res, next) => {
    let carAdminInfo = await AdminCarInfo.findOne({
      carId: req.body.carId,
    });
    return res.status(200).json({
      carAdminInfo: carAdminInfo,
    });
  },
};

module.exports = carController;
