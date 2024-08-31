const express = require('express');
const router = express.Router();
const Car = require('../Models/Car');
const User = require('../Models/User');
const Enquiry = require('../Models/Enquiry');

// Endpoint to get the count of cars
router.get('/countCars', async (req, res) => {
    try {
        const carCount = await Car.countDocuments();
        res.json({ count: carCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Endpoint to get the count of users
router.get('/countUsers', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ count: userCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Endpoint to get the count of enquiries
router.get('/countEnquiries', async (req, res) => {
    try {
        const enquiryCount = await Enquiry.countDocuments();
        res.json({ count: enquiryCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
