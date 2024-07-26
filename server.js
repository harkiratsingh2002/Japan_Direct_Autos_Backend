require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const cron = require('node-cron');

var cors = require('cors');
const userRouter = require('./Routes/userRoutes');
const User = require('./Models/User');
const Car = require('./Models/Car');
const carRouter = require('./Routes/carRoutes');
const path = require('path');
const Contact = require('./Models/Contact');
// const sendEmail = require('./mailer');
const reviewRouter = require('./Routes/reviewRoutes');

const carController = require('./Controllers/carController');
const subscriberRouter = require('./Routes/subscriberRoutes');
const subscriberController = require('./Controllers/subscriberController');
const authentication = require('./Middlewares/authentication');
const EnquiryRouter = require('./Routes/EnquiryRoutes');
// const passport = require('passport');
// const OAuth2Strategy = require('passport-google-oauth2').Strategy

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize());


// passport.use(
//   new OAuth2Strategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "/auth/google/callback",
//     scope:["profile","email"]
//   },async(accessToken,refreshToken,profile,done)=>{
//     console.log('profile:- ',profile);
//     try {
//       let user = await User.find({
//         email: profile.emails[0].value
//       })
//       if(user){
//         // create token.
//       }
//       else{
//         // create new user and save to database.
//         user = new User();
//         user.firstName = profile.displayName;
//         user.email = profile.email[0].value;
//         user.role = 'customer';
//         user = await user.save();
//       }
//       return done(null,user);
//     }
//     catch(err){
//       return done(err,null)
//     }
//   }
// )
// )
// passport.serializeUser((user,done)=>{
//   done(null,user);
// })
// passport.deserializeUser((user,done)=>{
//   done(null,user);
// })

// app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));
// app.get("/auth/google/callback",passport.authenticate("google",{
//   successRedirect:"http://"
// }))
app.use(userRouter);
app.use(carRouter);
app.use(reviewRouter);
app.use(subscriberRouter);
app.use(EnquiryRouter);

const staticPath = path.join(__dirname, 'uploads');
app.use(express.static(staticPath));

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'uploads'); // Set the destination directory for uploads
    },
    filename: function (req, file, callback) {
      callback(null, Date.now() + '-' + file.originalname); // Set the filename with timestamp
    }
  });
  
  const upload = multer({ storage: storage });

//   let arr = [{
//     name: 'carImg-0',
//     maxCount: 1
//   },
//   {
//     name: 'carImg-1',
//     maxCount: 1
//   },
//   {
//     name: 'carImg-2',
//     maxCount: 1
//   },
//   {
//     name: 'carImg-3',
//     maxCount: 1
//   }
// ]

// let arr = []


  app.post('/add-car', upload.array('images[]',7),authentication, carController.addCar);

app.post('/contact-us',async (req,res,next)=>{
  let newContact = new Contact()
  newContact.name = req.body.name;
  newContact.email = req.body.email;
  newContact.message = req.body.message;
  await newContact.save();
  return res.status(201).json({
    message: 'Your message have been received will be responded shortly.'
  })
})

// app.post('/send-email', async (req, res) => {
//   const { to } = req.body; // Get email details from request body
//   try {
//     await sendEmail(to, 'Welcome Subscribed to Japan Direct Autos Newsletter...!!!', 'You will be notified whenever a new car is added.');
//     res.json({ message: 'Email sent successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending email' });
//   }
// });
// code to send emails.
// const transporter = nodemailer.createTransport(transport);
const cronJob = cron.schedule('0 9 * * MON', () => {
  subscriberController.sendProductAddedEmail().then();
})

cronJob.start();

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connection established...🔗");
    app.listen(process.env.PORT, () => {
      console.log(`Server running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌❌ Error connecting to server ❌❌", err));