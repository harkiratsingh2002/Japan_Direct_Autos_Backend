const Enquiry = require("../Models/Enquiry");
const nodemailer = require("nodemailer");

const EnquiryController = {
  sendEnquiry: async (req, res, next) => {
    try {
      let user = req.user; // Might be undefined for anonymous users
      let email = null;
      let enquiredBy = null;

      if (user) {
        enquiredBy = user._id;
        email = user.email;
      } else {
        // Handle anonymous users
        email = req.body.email;
        if (!email) {
          return res.status(400).json({
            message: "Email is required for anonymous enquiries.",
          });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            message: "Invalid email format.",
          });
        }
      }

      // Check for existing enquiries
      let existingEnquiryQuery = {
        carId: req.body.carId,
        completed: false,
      };

      if (enquiredBy) {
        existingEnquiryQuery.enquiredBy = enquiredBy;
      } else {
        existingEnquiryQuery.enquiredByEmail = email;
      }

      let existingEnquiry = await Enquiry.find(existingEnquiryQuery);

      if (existingEnquiry.length > 0) {
        return res.status(200).json({
          message: "Your enquiry is already in process.",
        });
      }

      // Create new enquiry
      let enquiry = new Enquiry({
        enquiredBy: enquiredBy, // Can be null
        enquiredByEmail: email,
        enquirySubject: req.body.enquirySubject,
        enquiryText: req.body.enquiryText,
        carId: req.body.carId,
        carLink: req.body.carLink,
        completed: false,
      });

      let savedEnquiry = await enquiry.save();

      // Send email to admin
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

      let userName = user
        ? `${user.firstName} ${user.lastName}`
        : "Anonymous User";

      const htmlContent = `
        <h1>You Have a New Enquiry</h1>
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
              <td style="border: 1px solid black;">Name</td>
              <td style="border: 1px solid black;">${userName}</td>
            </tr>
            <tr>
              <td style="border: 1px solid black;">Email</td>
              <td style="border: 1px solid black;">${email}</td>
            </tr>
          </tbody>
        </table>
        <h3>Car Details Link</h3>
        <p>${req.body.carLink}</p>
        <h4>User Subject: ${req.body.enquirySubject}</h4>
        <p>Enquiry: ${req.body.enquiryText}</p>
        <h4>Enquiry ID: ${savedEnquiry._id}</h4>
      `;

      const mailOptions = {
        from: process.env.USER,
        to: process.env.USER,
        subject: "Important: New Enquiry",
        html: htmlContent,
      };

      await transport.sendMail(mailOptions);

      return res.status(201).json({
        message:
          "Your enquiry has been sent. A representative will contact you via email soon.",
      });
    } catch (error) {
      console.error("Error while sending enquiry:", error);
      return res.status(500).json({
        message: "A server error occurred.",
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
