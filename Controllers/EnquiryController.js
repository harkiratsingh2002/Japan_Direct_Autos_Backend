const Enquiry = require("../Models/Enquiry");
const nodemailer = require("nodemailer");

const EnquiryController = {
  sendEnquiry: async (req, res, next) => {
    // get details from req

    try {
        let user = req.user;
        console.log('user',user)
        let enquiry = await Enquiry.find({
          enquiredBy: user._id,
          carId: req.body.carId,
          completed: false,
        });
        if (enquiry.length > 0) {
          // already enquired
          return res.status(200).json({
            message: "Your enquiry is already in process.",
          });
        }
        // fill in db
        enquiry = new Enquiry();
        enquiry.enquiredBy = user._id;
        enquiry.enquiredByEmail = user.email;
        enquiry.enquirySubject = req.body.enquirySubject;
        enquiry.enquiryText = req.body.enquiryText;
        enquiry.carId = req.body.carId;
        enquiry.carLink = req.body.carLink;
        enquiry.completed = false;
        let savedEnquiry = await enquiry.save();
        // send email to admin
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
    
        const htmlContent = ` 
                    <h1>You Have a new enquiry</h1>
                    <h3>User Data</h3>
                    <table style="margin:3em; border: 1px solid black;">
                        
      <thead>
        <tr>
          <th style="border: 1px solid black;">Properties</th>
          <th style="border: 1px solid black;">Values</th>
          </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid black;">Name </td>
          <td style="border: 1px solid black;">${user.firstName} ${user.lastName}</td>
          </tr>
        <tr>
          <td style="border: 1px solid black;">Email</td>
          <td style="border: 1px solid black;">${user.email}</td>
          </tr>
      </tbody>
      </table>
                    <h3>Car Details Link </h3>
                    <p>${req.body.carLink}</p>
                    <h4>User subject: ${req.body.enquirySubject}</h4>
                    <p>Enquiry:- ${req.body.enquiryText}</p>
                    <h4>Enquiry Id:- ${savedEnquiry._id}</h4>
    
                `;
                const mailOptions = {
                    from: "milansinghdav@gmail.com",
                    to: "milansinghdav@gmail.com",
                    subject:
                      "Important: New Enquiry",
                    html: htmlContent,
                  };
                await transport.sendMail(mailOptions);
                return res.status(201).json({
                   message: 'Enquiry is sent to one of our representative. You will be contacted soon via email.' 
                })
    } catch (error) {
        console.log('error while sending Enquiry:-',error)
        return res.status(500).json({
            message: 'Some server error occured.'
        })
    }
   
  },
  getFiveEnquiries: async (req,res,next) =>{

    let page = req.body.page
    let totalEnquiries = await Enquiry.find().countDocuments();
    let enquiries = await Enquiry.find().populate('enquiredBy','email').skip(5 * (page - 1)).limit(5);

    return res.status(200).json({
      total: totalEnquiries,
      enquiries: enquiries
    })
  },
  deleteEnquiry: async (req,res,next) =>{

    await Enquiry.findByIdAndDelete(req.body.enquiryId)
    return res.status(200).json({
      message: 'Enquiry deleted succeessfully.'
    })
  },
  completeEnquiry: async (req,res,next)=>{
    try {
      let enquiry = await Enquiry.findById(req.body.enquiryId)
      if(!enquiry){
         let newError = {
          message: 'Enquiry not found.'
         }
         throw newError
      }
      enquiry.completed = true
      await enquiry.save();
      return res.status(200).json({
        message: 'Enquiry Completed'
      })
    } catch (error) {
      console.log('error while completing enquiry.',error);
      return res.status(500).json({
        message: error.message
      })
    }
  },
  filterEnquiry: async (req,res,next)=>{
    try {
      const total = await Enquiry.find({ completed: req.body.completed}).countDocuments();
      const filteredEnquiries = await Enquiry.find(
        {
          completed: req.body.completed
        }
      ).populate("enquiredBy","email").skip(5 *(req.body.page - 1)).limit(5)
      return res.status(200).json({
        total,
        filteredEnquiries
      })
    } catch (error) {
      console.log('err while filtering enquiry',error)
      return res.status(500).json({
        message: error.message
      })
    }
  },
  searchEnquiries: async(req,res,next) =>{
    try {
      const total = await Enquiry.find({
        $text: {$search: req.body.searchText}
      }).countDocuments()
      console.log('total search: ',total)
      const searchResult = await Enquiry.find({
        $text: {$search: req.body.searchText}
      }).populate("enquiredBy","email").skip(5 *(req.body.page - 1)).limit(5)

      return res.status(200).json({
        total,
        searchResult
      })

    } catch (error) {
      console.log('err while filtering enquiry',error)
      return res.status(500).json({
        message: error.message
      })
    }
  },
  searchEnquiriesByEmail: async(req,res,next)=>{
    try {
      const total = await Enquiry.find({
        enquiredByEmail: (req.body.email).trim()
      }).countDocuments();
      let enquiries = await Enquiry.find({
        enquiredByEmail: (req.body.email).trim()

      }).populate("enquiredBy","email").skip(5 * (req.body.page - 1)).limit(5)
      return res.status(200).json({
        total,
        searchResult: enquiries
      })
    } catch (error) {
      console.log('err:-',error)
      return res.status(500).json({
        message: error.message
      })
    }
  },
  getYourEnquiries: async (req,res,next)=>{
    try {
      let total = await Enquiry.find({
        enquiredBy: req.user._id 
      }).countDocuments();
      let yourEnquiries = await Enquiry.find({
        enquiredBy: req.user._id
      }).skip(5 * (req.body.page - 1)).limit(5)
  
      return res.status(200).json({
        yourEnquiries,
        total
      })
    } catch (error) {
      console.log('err:-',error)
      return res.status(500).json({
        message: error.message
      })
    }
   
  }
};

module.exports = EnquiryController
