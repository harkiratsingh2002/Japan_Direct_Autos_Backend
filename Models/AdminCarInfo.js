const mongoose = require("mongoose");

const AdminCarInfoSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Car",
    unique: true,
  },
  costPrice: String,
  brokerForwarderHandlingFees: String,
  preShipInspection: String,
  inlandTransport: String,
  freightInsurance: String,
  gst: String,
  customClearance: String,
});

const AdminCarInfo = mongoose.model("AdminCarInfo", AdminCarInfoSchema);

module.exports = AdminCarInfo;
