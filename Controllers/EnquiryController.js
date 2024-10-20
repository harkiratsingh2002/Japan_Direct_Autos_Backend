const Enquiry = require("../Models/Enquiry");
const nodemailer = require("nodemailer");

const EnquiryController = {
  sendEnquiry: async (req, res, next) => {
    try {
      let user = req.user || null; // Check if user is logged in
      console.log("user", user);

      // Handle enquiry creation logic based on login status
      let existingEnquiry = null;
      if (user) {
        // For logged-in users, check if they already enquired about this car
        existingEnquiry = await Enquiry.findOne({
          enquiredBy: user._id,
          carId: req.body.carId,
          completed: false,
        });

        if (existingEnquiry) {
          return res.status(200).json({
            message: "You already have an enquiry in process for this car.",
          });
        }
      }

      // Create new enquiry
      const enquiry = new Enquiry({
        carId: req.body.carId,
        carLink: req.body.carLink,
        enquirySubject: req.body.enquirySubject,
        enquiryText: req.body.enquiryText,
        completed: false,
      });

      // Populate user info based on login status
      if (user) {
        enquiry.enquiredBy = user._id;
        enquiry.enquiredByEmail = user.email;
        enquiry.enquiredByName = `${user.firstName} ${user.lastName}`;
      } else {
        enquiry.enquiredByEmail = req.body.enquiredByEmail;
        enquiry.enquiredByName = req.body.enquiredByName;
      }

      const savedEnquiry = await enquiry.save();

      // Send email notification to admin
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER,
          pass: process.env.EMAIL_PASS,
          clientId: process.env.CLIENT_ID_2,
          clientSecret: process.env.CLIENT_SECRET_2,
          refreshToken: process.env.REFRESH_TOKEN_2,
        },
      });

      const htmlContent = `
          <h1>New Enquiry Received</h1>
          <h3>User Details</h3>
          <table style="border: 1px solid black;">
            <tr><td>Name</td><td>${user ? `${user.firstName} ${user.lastName}` : req.body.enquiredByName}</td></tr>
            <tr><td>Email</td><td>${user ? user.email : req.body.enquiredByEmail}</td></tr>
          </table>
          <h3>Car Details</h3>
          <p><a href="${req.body.carLink}">View Car</a></p>
          <h4>Enquiry Subject: ${req.body.enquirySubject}</h4>
          <p>Message: ${req.body.enquiryText}</p>
          <h4>Enquiry ID: ${savedEnquiry._id}</h4>
        `;

      const mailOptions = {
        from: process.env.USER,
        to: process.env.USER,
        subject: "New Car Enquiry",
        html: htmlContent,
      };

      await transport.sendMail(mailOptions);

      return res.status(201).json({
        message: "Your enquiry has been submitted successfully. Our team will contact you shortly.",
      });
    } catch (error) {
      console.error("Error sending enquiry:", error);
      return res.status(500).json({
        message: "An error occurred while sending your enquiry. Please try again later.",
      });
    }
  },






  getFiveEnquiries: async (req, res, next) => {
    let page = req.body.page;
    let totalEnquiries = await Enquiry.find().countDocuments();
    let enquiries = await Enquiry.find()
      .populate("enquiredBy", "email")
      .skip(5 * (page - 1))
      .limit(5);

    return res.status(200).json({
      total: totalEnquiries,
      enquiries: enquiries,
    });
  },
  deleteEnquiry: async (req, res, next) => {
    await Enquiry.findByIdAndDelete(req.body.enquiryId);
    return res.status(200).json({
      message: "Enquiry deleted succeessfully.",
    });
  },
  completeEnquiry: async (req, res, next) => {
    try {
      let enquiry = await Enquiry.findById(req.body.enquiryId);
      if (!enquiry) {
        let newError = {
          message: "Enquiry not found.",
        };
        throw newError;
      }
      enquiry.completed = true;
      await enquiry.save();
      return res.status(200).json({
        message: "Enquiry Completed",
      });
    } catch (error) {
      console.log("error while completing enquiry.", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  filterEnquiry: async (req, res, next) => {
    try {
      const total = await Enquiry.find({
        completed: req.body.completed,
      }).countDocuments();
      const filteredEnquiries = await Enquiry.find({
        completed: req.body.completed,
      })
        .populate("enquiredBy", "email")
        .skip(5 * (req.body.page - 1))
        .limit(5);
      return res.status(200).json({
        total,
        filteredEnquiries,
      });
    } catch (error) {
      console.log("err while filtering enquiry", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  searchEnquiries: async (req, res, next) => {
    try {
      const total = await Enquiry.find({
        $text: { $search: req.body.searchText },
      }).countDocuments();
      console.log("total search: ", total);
      const searchResult = await Enquiry.find({
        $text: { $search: req.body.searchText },
      })
        .populate("enquiredBy", "email")
        .skip(5 * (req.body.page - 1))
        .limit(5);

      return res.status(200).json({
        total,
        searchResult,
      });
    } catch (error) {
      console.log("err while filtering enquiry", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  searchEnquiriesByEmail: async (req, res, next) => {
    try {
      const total = await Enquiry.find({
        enquiredByEmail: req.body.email.trim(),
      }).countDocuments();
      let enquiries = await Enquiry.find({
        enquiredByEmail: req.body.email.trim(),
      })
        .populate("enquiredBy", "email")
        .skip(5 * (req.body.page - 1))
        .limit(5);
      return res.status(200).json({
        total,
        searchResult: enquiries,
      });
    } catch (error) {
      console.log("err:-", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  getYourEnquiries: async (req, res, next) => {
    try {
      let total = await Enquiry.find({
        enquiredBy: req.user._id,
      }).countDocuments();
      let yourEnquiries = await Enquiry.find({
        enquiredBy: req.user._id,
      })
        .skip(5 * (req.body.page - 1))
        .limit(5);

      return res.status(200).json({
        yourEnquiries,
        total,
      });
    } catch (error) {
      console.log("err:-", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  },
};

module.exports = EnquiryController;
