const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: false,
  },
  name: String,
  oldOrNew: String,
  carType: String,
  year: String,
  price: String,
  brand: String,
  description: String,
  images: {
    type: [String],
  },
  engine: {
    type: String,
  },
  suspension: String,
  transmission: String,
  fuelType: String,
  mileage: String,
  seatingCapacity: String,
  color: String,
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: false,
  },
});
CarSchema.index({'$**': 'text'});
const Car = mongoose.model("Car", CarSchema);

module.exports =  Car