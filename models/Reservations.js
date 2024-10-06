// models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobileNumber: String,
    date: String,
    time:String,
    noOfGuests: Number,
    seatingPreference:String,
    assignedTable: {type: mongoose.Schema.Types.ObjectId,ref: 'Table',required: true},
    //creator:{type:mongoose.Types.ObjectId, required: true, ref:'User'}
});

const Reservation = mongoose.model('Reservations', reservationSchema);
module.exports = Reservation;
