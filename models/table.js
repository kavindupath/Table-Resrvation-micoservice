const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tableSchema = new Schema({
  seatingCapacity: { type: Number, required: true }, // Number of people the table can seat
  seatingPreference: {
    type: String,
    enum: ["indoor", "outdoor", "window"],
    required: true,
  }, // Seating preference (indoor/outdoor)
  available: { type: Boolean, default: true }, // Whether the table is available for reservation
  reservations: [
    {
      date: { type: String }, // Store the reservation date
      time: { type: String }, // Store the reservation time
    },
  ],
});

module.exports = mongoose.model("Table", tableSchema);
