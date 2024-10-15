const User = require("../Models/User");
const bcryptjs = require("bcryptjs");
var salt = bcryptjs.genSaltSync(10);
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");

const userController = {
  addAdmin: async (req, res, next) => {
    try {
      let user = await User.find({
        email: req.body.email,
      });
      if (user.length != 0) {
        let newError = {
          status: 401,
          message: "user already exist",
        };
        throw newError;
      }
      let newUser = new User();
      newUser.email = req.body.email;
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;

      let hash = bcryptjs.hashSync(req.body.password, salt);
      newUser.password = hash;
      newUser.role = "admin";
      newUser.save();
      return res.status(201).json({
        message: "added succefully..!!",
      });
    } catch (err) {
      console.log("error while seting up admin", err);
      return res.status(401).json({
        message: err.message,
      });
    }
  },
  loginAdmin: (req, res, next) => {
    try {
      let user = User.find({
        email: "milansinghdav@gmail.com",
      });
      if (user.length == 0) {
        let newError = {
          status: 404,
          message: "user not found",
        };
      }
      //check password
      if (bcryptjs.compareSync(req.body.password, user.password)) {
        return res.status(201).json({
          message: "Sign In successfull...!!!",
        });
      }
      return res.status(401).json({
        message: "wrong password...!!!",
      });
      // true
    } catch (err) {
      console.log("error while sign up:- ", err);
    }
  },
  signupUser: async (req, res, next) => {
    try {
      let userResult = await User.find({
        email: req.body.email,
      });
      if (userResult.length > 0) {
        let newError = {
          status: 401,
          message: "User with that email already exist",
        };

        throw newError;
      }
      let newUser = new User();
      let { firstName, lastName, email, password, twoStepVerify } = req.body;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.email = email;
      let hash = bcryptjs.hashSync(req.body.password, salt);
      newUser.password = hash;

      newUser.role = "customer";
      newUser.twoStepVerify = twoStepVerify;
      let savedUser = await newUser.save();
      return res.status(201).json({ message: "user Added successfully..!" });
    } catch (err) {
      console.log("error while signing up..!!", err);
      return res.status(401).json({ message: err.message });
    }
  },
  loginUser: async (req, res, next) => {
    try {
      let userResult = await User.find({
        email: req.body.email,
      }).populate("wishlist");
      if (userResult.length == 0) {
        return res.status(401).json({
          message: "Wrong email or password.",
        });
      }
      console.log("userResult:- ", userResult);
      let hashedPassword = userResult[0].password;
      if (!bcryptjs.compareSync(req.body.password, hashedPassword)) {
        return res.status(401).json({
          message: "Wrong email or password.",
        });
      }
      let data = { ...userResult[0]._doc };
      delete data.password;
      console.log("data:- ", data);
      // 2 step verify
      if (userResult[0].twoStepVerify) {
        const min = 1000; // Minimum 4-digit number
        const max = 9999; // Maximum 4-digit number

        // Generate a random number between min and max

        const otp = Math.floor(Math.random() * (max - min + 1)) + min;
        // send otp to email
        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.USER,
            password: process.env.EMAIL_PASS,
            clientId: process.env.CLIENT_ID_2,
            clientSecret: process.env.CLIENT_SECRET_2,
            refreshToken: process.env.REFRESH_TOKEN_2,
            //   accessToken: accessToken,
          },
        });

        const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
        font-size: 24px;
        margin-bottom: 10px;
      }
      p {
        font-size: 16px;
        color: #555;
      }
      .otp {
        font-size: 22px;
        font-weight: bold;
        color: #007bff;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #999;
        text-align: center;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Verify Your Email Address</h1>
      <p>Dear User,</p>
      <p>Thank you for registering with us! To complete your registration, please use the OTP (One-Time Password) below to verify your email address:</p>
      <p class="otp">${otp}</p>
      <p>This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The [Your Company Name] Team</p>
      <div class="footer">
        <p>If you need any help, feel free to <a href="mailto:support@yourcompany.com">contact our support team</a>.</p>
      </div>
    </div>
  </body>
  </html>
`;

        const mailOptions = {
          from: process.env.USER,
          to: req.body.email,
          subject: "Important: otp for 2 step verification.",
          html: htmlContent,
        };
        await transport.sendMail(mailOptions);
        // send otp and payload data to frontend for verification
        return res.status(200).json({
          twoStepVerify: true,
          otp: otp,
          payloadData: data,
        });
      }
      const payload = data;
      const token = jwt.sign(payload, secret, { expiresIn: "10h" });
      return res.status(200).json({
        message: "Logged In succeessfully.",
        userData: {
          userToken: token,
          wishlist: data.wishlist ? data.wishlist : [],
          firstName: data.firstName,
          role: data.role,
        },
      });
    } catch (err) {
      console.log("error while signing up..!!", err);
      return res.status(401).json({ message: err.message });
    }
  },
  checkTwoStepVerify: async (req, res, next) => {
    // get payload data and login user
    const payload = req.body.payloadData;
    const token = jwt.sign(payload, secret, { expiresIn: "10h" });
    return res.status(200).json({
      message: "Logged In succeessfully.",
      userData: {
        userToken: token,
        wishlist: payload.wishlist ? payload.wishlist : [],
        firstName: payload.firstName,
        role: payload.role,
      },
    });
  },
  signUpGoogle: async (req, res, next) => {
    const { firstName, lastName, email, role } = req.body;

    let user = await User.find({
      email: email,
    }).populate("wishlist");
    console.log("user data:-", user);
    if (user.length > 0) {
      if (user[0].role.toLowerCase() == "admin") {
        return res.status(401).json({
          message: "scince you are a admin so use password to login.",
        });
      }
    }
    let token = "";
    if (user.length > 0) {
      const payload = user[0]._doc;
      token = jwt.sign(payload, secret, { expiresIn: "2h" });
    } else {
      user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.role = role;
      user = await user.save();
      const payload = user;
      token = jwt.sign(payload, secret, { expiresIn: "2h" });
    }
    let data = { ...user[0]._doc };
    return res.status(200).json({
      message: "Logged In succeessfully.",
      userData: {
        userToken: token,
        wishlist: data.wishlist ? data.wishlist : [],
        firstName: firstName,
        role: role,
      },
    });

    // let savedUser = await user.save()
  },
  checkAdmin: (req, res, next) => {
    console.log("user: ", req.user);
    if (req.user.role.toLowerCase() == "admin") {
      return res.status(200).json({
        isAdmin: true,
      });
    } else {
      return res.status(401).json({
        message: "you are not authorized",
        isAdmin: false,
      });
    }
  },
  addUserAdmin: async (req, res, next) => {
    try {
      if (req.user.role.toLowerCase() == "admin") {
        let user = await User.find({
          email: req.body.email,
        });
        let { firstName, lastName, email, role, password } = req.body;
        if (user.length > 0) {
          let newError = {
            message: "user already exist.",
          };
          throw newError;
        } else {
          user = new User();
          user.firstName = firstName;
          user.lastName = lastName;
          user.email = email;
          user.role = role;
          let hash = bcryptjs.hashSync(req.body.password, salt);
          // newUser.password = hash;
          user.password = hash;
          await user.save();
          return res.status(201).json({
            message: "user added successfully.",
          });
        }
      } else {
        let newError = {
          message: "only admin is allowed to add user.",
        };
        throw newError;
      }
    } catch (error) {
      console.log("error while adding user:- ", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getFiveUsers: async (req, res, next) => {
    let page = req.body.page;
    let total = await User.find({}).countDocuments();
    let fiveUsers = await User.find({})
      .skip(5 * (page - 1))
      .limit(5);

    return res.status(200).json({
      total,
      fiveUsers,
    });
  },
  getUserData: async (req, res, next) => {
    try {
      let user = await User.findById(req.body.userId);
      if (!user) {
        let newError = {
          message: "user not found",
        };
        throw newError;
      } else {
        let obj = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          password: user.password,
          confirmPassword: user.password,
        };
        return res.status(200).json({
          userData: obj,
        });
      }
    } catch (error) {
      console.log("err while getting userData:- ", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  editUserAdmin: async (req, res, next) => {
    try {
      if (req.user.role.toLowerCase() == "admin") {
        let user = await User.findById(req.body.userId);
        if (!user) {
          let newError = {
            message: "user not found",
          };
          throw newError;
        } else {
          let { firstName, lastName, email, role } = req.body;
          user.firstName = firstName;
          user.lastName = lastName;
          user.email = email;
          user.role = role;
          await user.save();
          return res.status(200).json({
            message: "user updated successfully.",
          });
        }
      } else {
        let newError = {
          message: "you are unauthorized to update",
        };
        throw newError;
      }
    } catch (err) {
      console.log("user updating error:- ", err);
      return res.status(500).json({
        message: err.message,
      });
    }
  },
  searchUser: async (req, res, next) => {
    try {
      const total = await User.find({
        $text: { $search: req.body.searchText },
      }).countDocuments();
      const fiveUsers = await User.find({
        $text: { $search: req.body.searchText },
      })
        .skip(5 * (req.body.page - 1))
        .limit(5);
      return res.status(200).json({
        fiveUsers,
        total,
      });
    } catch (error) {
      console.log("error while searching user:- ", error);
      return res.status(500).json({
        message: "some server error",
      });
    }
  },
  searchUserByEmail: async (req, res, next) => {
    try {
      const user = await User.find({
        email: req.body.email,
      });
      if (user.length == 0) {
        let newError = {
          message: "user not found",
        };
        throw newError;
      } else {
        return res.status(200).json({
          user,
          total: 1,
        });
      }
    } catch (error) {
      console.log("error while search user by email:- ", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  deleteUser: async (req, res, next) => {
    await User.findByIdAndDelete(req.body.userId);
    return res.status(200).json({
      message: "Deleted Successfully.",
    });
  },
  forgotPassword: async (req, res, next) => {
    try {
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER,
          password: process.env.EMAIL_PASS,
          clientId: process.env.CLIENT_ID_2,
          clientSecret: process.env.CLIENT_SECRET_2,
          refreshToken: process.env.REFRESH_TOKEN_2,
          //   accessToken: accessToken,
        },
      });

      const htmlContent = ` 
                      <h1>Otp for changing password.</h1>
                      <h3>Otp:- ${req.body.otp}</h3>
                      `;
      const mailOptions = {
        from: process.env.USER,
        to: req.body.email,
        subject: "Important: otp for changing password.",
        html: htmlContent,
      };
      await transport.sendMail(mailOptions);
      return res.status(201).json({
        message: "otp sent.",
      });
    } catch (error) {
      console.log("error while sending Otp:-", error);
      return res.status(500).json({
        message: "Some server error occured.",
      });
    }
  },
  changePassword: async (req, res, next) => {
    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        let newError = {
          message: "user not found",
        };
        throw newError;
      } else {
        let hash = bcryptjs.hashSync(req.body.newPassword, salt);

        user.password = hash;

        await user.save();
        return res.status(201).json({
          message: "Password changed.",
        });
      }
    } catch (error) {
      console.log("error while changing password:- ", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getUser: async (req, res, next) => {
    let twoStepVerify = false;
    if (req.user.hasOwnProperty("twoStepVerify")) {
      twoStepVerify = req.user.twoStepVerify;
    }
    return res.status(200).json({
      user: req.user,
      twoStepVerify: twoStepVerify,
    });
  },
  updateUser: async (req, res, next) => {
    try {
      let user = await User.findOne({ email: req.body.oldEmail });
      if (!user) {
        let newError = {
          message: "user not found.",
        };
        throw newError;
      } else {
        if (req.body.oldEmail != req.body.newUserData.email) {
          let chkUser = await User.findOne({
            email: req.body.newUserData.email,
          });
          if (chkUser) {
            let newError = {
              message: "User with that email already exist",
            };
            throw newError;
          }
        }
        user.firstName = req.body.newUserData.firstName;
        user.lastName = req.body.newUserData.lastName;
        user.email = req.body.newUserData.email;
        await user.save();

        return res.status(200).json({
          message: "user updated successfully.",
        });
      }
    } catch (error) {
      console.log("err while updating user", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  addToWishlist: async (req, res, next) => {
    try {
      let usr = await User.findById(req.user._id);
      if (!usr) {
        let newError = {
          message: "user not found.",
        };
        throw newError;
      }
      // let carId = usr.wishlist.find((item) => {
      //   return item == req.body.carId;
      // });
      if (usr.wishlist.includes(req.body.carId)) {
        let newError = {
          message: "Car already added to wishlist",
        };
        throw newError;
      } else if (usr.wishlist.length >= 25) {
        let newError = {
          message: "Maximum 25 cars can be added to wishlist.",
        };
        throw newError;
      } else {
        usr.wishlist.unshift(req.body.carId);
        await usr.save();
        return res.status(201).json({
          message: "Car added to wishlist.",
        });
      }
    } catch (error) {
      console.log("err while adding to wishlist", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getWishlistCars: async (req, res, next) => {
    try {
      let usr = await User.findById(req.user._id).populate("wishlist");
      if (!usr) {
        let newError = {
          message: "user not found.",
        };
        throw newError;
      } else {
        return res.status(200).json({
          cars: usr.wishlist,
        });
      }
    } catch (error) {
      console.log("err while getting wishlist", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  removeFromWishlist: async (req, res, next) => {
    try {
      let usr = await User.findById(req.user._id);
      if (!usr) {
        let newError = {
          message: "user not found.",
        };
        throw newError;
      }
      let index = usr.wishlist.indexOf(req.body.carId);
      usr.wishlist.splice(index, 1);
      await usr.save();
      return res.status(201).json({
        message: "Removed successfully.",
      });
    } catch (error) {
      console.log("err while deleting from wishlist", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getWishlistLength: async (req, res, next) => {
    try {
      let usr = await User.findById(req.user._id);
      if (!usr) {
        let newError = {
          message: "user not found.",
        };
        throw newError;
      }
      return res.status(200).json({
        length: usr.wishlist.length,
      });
    } catch (error) {
      console.log("err while getting wishlist length", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  enableTwoStepVerify: async (req, res, next) => {
    try {
      let user = await User.findById(req.user._id);
      if (!user) {
        let error = {
          message: "user not found",
        };
        throw error;
      } else {
        user.twoStepVerify = true;
        await user.save();
        return res.status(200).json({
          message: "Enabled Successfully",
        });
      }
    } catch (error) {
      console.log("err while enabling two step verify", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  disableTwoStepVerify: async (req, res, next) => {
    try {
      let user = await User.findById(req.user._id);
      if (!user) {
        let error = {
          message: "user not found",
        };
        throw error;
      } else {
        user.twoStepVerify = false;
        await user.save();
        return res.status(200).json({
          message: "Disabled Successfully",
        });
      }
    } catch (error) {
      console.log("err while Disabling two step verify", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
};

module.exports = userController;
