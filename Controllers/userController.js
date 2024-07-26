const User = require("../Models/User");
const bcryptjs = require("bcryptjs");
var salt = bcryptjs.genSaltSync(10);
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

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
      let { firstName, lastName, email, password } = req.body;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.email = email;
      let hash = bcryptjs.hashSync(req.body.password, salt);
      newUser.password = hash;

      newUser.role = "customer";
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
      });
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
      const payload = data;
      const token = jwt.sign(payload, secret, { expiresIn: "10h" });
      return res.status(200).json({
        message: "Logged In succeessfully.",
        userData: {
          userToken: token,

          firstName: data.firstName,
          role: data.role,
        },
      });
    } catch (err) {
      console.log("error while signing up..!!", err);
      return res.status(401).json({ message: err.message });
    }
  },
  signUpGoogle: async (req, res, next) => {
    const { firstName, lastName, email, role } = req.body;

    let user = await User.find({
      email: email,
    });
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

    return res.status(200).json({
      message: "Logged In succeessfully.",
      userData: {
        userToken: token,

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
  getFiveUsers: async (req,res,next)=>{
    let page = req.body.page
    let total = await User.find({}).countDocuments();
    let fiveUsers = await User.find({}).skip(5 *(page - 1)).limit(5);

    return res.status(200).json({
      total,
      fiveUsers
    })

  },
  getUserData: async (req,res,next) =>{
    try {
      let user = await User.findById(req.body.userId)
      if(!user){
        let newError = {
          message: 'user not found'
        }
        throw newError;
      }
      else{
        let obj = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          password: user.password,
          confirmPassword: user.password
        }
        return res.status(200).json({
          userData: obj,
        })
      }
    } catch (error) {
      console.log('err while getting userData:- ',error);
      return res.status(500).json({
        message: error.message
      })
    }
  },
  editUserAdmin: async (req,res,next)=>{
    try {
      if (req.user.role.toLowerCase() == "admin") {
        let user = await User.findById(req.body.userId);
        if(!user){
          let newError = {
            message: 'user not found'
          }
          throw newError;
        }
        else{
          let {firstName , lastName, email, role} = req.body
          user.firstName = firstName;
          user.lastName = lastName;
          user.email = email;
          user.role = role;
          await user.save();
          return res.status(200).json({
            message: 'user updated successfully.'
          })
        }
      }
      else {
        let newError = {
          message: 'you are unauthorized to update'
        }
        throw newError;
      }
    }
    catch(err){
      console.log('user updating error:- ',err);
      return res.status(500).json({
        message: err.message
      })
    }
  },
  searchUser: async(req,res,next)=>{
    try {
      const total = await User.find({
        $text: {$search: req.body.searchText}
      }).countDocuments()
      const fiveUsers = await User.find({
        $text: {$search: req.body.searchText}
      }).skip(5 *(req.body.page - 1)).limit(5)
      return res.status(200).json({
        fiveUsers,
        total
      })
    } catch (error) {
      console.log('error while searching user:- ',error);
      return res.status(500).json({
        message: 'some server error'
      })
    }
  },
  searchUserByEmail: async(req,res,next)=>{
    try {
      const user = await User.find({
        email: req.body.email
      })
      if(user.length == 0){
        let newError = {
          message: 'user not found'
        }
        throw newError
      }
      else{
        return res.status(200).json({
          user,
          total: 1
        })

      }
    } catch (error) {
      console.log('error while search user by email:- ',error);
      return res.status(500).json({
        message: error.message
      })
    }
  },
  deleteUser: async (req,res,next)=>{
    await User.findByIdAndDelete(req.body.userId);
    return res.status(200).json({
      message: 'Deleted Successfully.'
    })
  }
};

module.exports = userController;
