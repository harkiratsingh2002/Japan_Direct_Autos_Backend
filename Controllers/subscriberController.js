const nodemailer = require("nodemailer");
// const { google } = require("googleapis");
const Car = require("../Models/Car");
const fs = require('fs');
const Subscriber = require("../Models/Subscriber");

// const mime = require('mime');
const subscriberController = {

  addSubscriber: async (req,res,next) => {

    try {
      
      let subscriber = await Subscriber.find({ email: req.body.to})
      if(subscriber.length > 0){
        return res.status(200).json({message: 'You are already subscribed.'})
      }
      else{
        subscriber = new Subscriber();
        subscriber.email = req.body.to;
        await subscriber.save();
        return res.status(200).json({message: 'You are added to subscription list.'})
      }
    } catch (error) {
      console.log('subscription err:- ',err);
    }
  },
  sendProductAddedEmail: async (req, res, next) => {
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       type: 'OAuth2',
    //       user: secure_configuration.milansinghdav@gmail.com,
    //       pass: secure_configuration.Milansingh@1,
    //       clientId: secure_configuration.808418854320-gdljs4ete1786h97oa8at7ibhuhfi6pq.apps.googleusercontent.com,
    //       clientSecret: secure_configuration.CLIENT_SECRET,
    //       refreshToken: secure_configuration.REFRESH_TOKEN
    //     }
    //   });
    try {
      const carDataCount = await Car.find({}).countDocuments()
      const carData = await Car.find({}).skip(carDataCount-3).limit(3);

    //   const oauth2Client = new google.auth.OAuth2(
    //     "378521593401-9b7n8l6qtbfkc2ob28e6umqtj5ukacmc.apps.googleusercontent.com",
    //     "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",
    //     "https://developers.google.com/oauthplayground"
    //   );

    //   oauth2Client.setCredentials({
    //     refresh_token: "1//04ZhYQJ5_ygf3CgYIARAAGAQSNwF-L9Ir4FXp6efawGLvZ2hM2rwQYUlnRpI57ZIemAi_iWhiioxRNYWiowiC6le-D3I70S0CQrg",
    //   });

    //   const accessToken = await oauth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "milansinghdav@gmail.com",
          password: process.env.EMAIL_PASS,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        //   accessToken: accessToken,
        },
      });

      // function encodeImage(path) {
      //   const buffer = fs.readFileSync(path);
      //   return `data:${mime.getType(path)};base64,${buffer.toString('base64')}`;
      // }

      const htmlContent = `
        <h1>Latest Cars Added to Our Collection!</h1>
    <p>We're excited to announce the arrival of three new cars to our collection:</p>
    <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
      ${carData
        .map(
          (car) => `
        <div style="background-color: #f1f1f1; width:'32%'  padding: 1rem; border-radius: 5px; margin: 25px;">
          <img src="cid:${car.images[0]}"  alt="${
            car.name
          }" style="width: 250px; height: 300px; display: block; object-fit: cover; margin-right: 25px;">
          <h2>${car.name}</h2>
        
          <a href="${"http://localhost:5173/car-details/" + car._id}">View Details</a>
        </div>
      `
        )
        .join("")}
    </div>
    <p>Don't miss out on these beauties! Visit our website to explore our entire collection.</p>
    <p>Sincerely,</p>
    <p>Japan Direct Autos Team</p>
      `;

      const subscribers = await Subscriber.find({})

      for(let subscriber of subscribers) {

        const mailOptions = {
          from: "milansinghdav@gmail.com",
          to: subscriber.email,
          subject:
            "Cruise into Excellence: Unveiling Our Latest Trio of Cutting-Edge Cars!",
          html: htmlContent,
        };
  
        const attachments = carData.map(car=>{
          return {
              filename: car.images[0],
              content: fs.readFileSync('./uploads/'+car.images[0]),
              cid: car.images[0]
          }
        })
        
        mailOptions.attachments = attachments;
  
        // const mailConfigurations = {
        //     from: 'milan.bhalla.personal@gmail.com',
        //     to: req.body.email,
        //     subject: 'Cruise into Excellence: Unveiling Our Latest Trio of Cutting-Edge Cars!',
        //     html: htmlContent
  
        // }
  
        let result = await transport.sendMail(mailOptions);
      }

      // console.log("email - result", result);
      // res.status(201).json({ message: "email sent successfully." });
    } catch (error) {
      console.log("email err:-", error);
    }
  },
};

module.exports = subscriberController;
