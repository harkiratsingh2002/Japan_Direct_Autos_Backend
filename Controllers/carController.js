const sendgridTransport = require("nodemailer-sendgrid-transport");
const Car = require("../Models/Car");
const User = require("../Models/User");

const nodemailer = require("nodemailer");
const nodemailerTransport = require("nodemailer-sendgrid-transport");
const fs = require("fs");

const carController = {
  // addCar: (req,res,next)=>{
  //     // create new car instance
  //     try {
  //         let user = User.find({email:'milansinghdav@gmail.com'})
  //         if(user.length == 0){
  //             return res.status(401).json({message: 'unauthorized'})
  //         }
  //         let adminid = user[0]._id;

  //         let newCar = new Car();
  //         let { name, carType, year,price,brand,engine,suspension,transmission,fuelType,mileage,seatingCapacity,color} = req.body;
  //         newCar.adminId = adminid;
  //         newCar.name = name;
  //         newCar.carType = carType;
  //         newCar.year  = year;
  //         newCar.price = price;
  //         newCar.brand = brand;
  //         newCar.engine = engine;
  //         newCar.mileage = mileage;
  //         newCar.suspension = suspension;
  //         newCar.transmission = transmission;
  //         newCar.fuelType = fuelType;
  //         newCar.seatingCapacity = seatingCapacity;
  //         newCar.color = color;

  //         let savedCar = newCar.save();
  //         if(!savedCar._id){
  //             let newError = {
  //                 status : 401,
  //                 message: 'error while adding car in server'
  //             }
  //             throw newError;
  //         }
  //         req.body.carId = savedCar._id;
  //         next();

  //     }
  //     catch(err){
  //         console.log('car adding errors:- ',err)
  //         return res.status(401).json({
  //             message: 'error while adding car in server'
  //         })
  //     }

  //     // add data to instance
  //     // save car instance

  // }

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
        name,
        oldOrNew,
        carType,
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
      newCar.name = name;
      newCar.oldOrNew = oldOrNew;
      newCar.carType = carType;
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
      return res.status(201).json({ message: "added succefully...!!" });

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
      car.images.forEach((imgPath)=>{

        fs.unlink(imgPath, (err) => {
          if (err) {
            console.error("Failed to delete image file:", err);
          } else {
            console.log("Image file deleted successfully!");
          }
        });
      })
      await Car.findByIdAndDelete(req.body.carId);

      return res.status(201).json({
        message: 'Car deleted successfully.'
      })

    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  },
  searchCars: async (req,res,next)=> {
    try {
      const total = await Car.find({
        $text: {$search: req.body.searchText}
      }).countDocuments()
      console.log('total search: ',total)
      const searchResult = await Car.find({
        $text: {$search: req.body.searchText}
      }) .populate("adminId", "email").skip(5 *(req.body.page - 1)).limit(5)

      return res.status(200).json({
        total,
        searchResult
      })

    } catch (error) {
      console.log('err while searching Cars',error)
      return res.status(500).json({
        message: error.message
      })
    }
  }
};

module.exports = carController;
