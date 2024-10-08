const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const Reservations = require("../models/Reservations");
const User = require("../models/user");
const Tables = require("../models/table");
const mongoose = require("mongoose");

exports.getReservations = async (req, res, next) => {
  let ReservationList;
  try {
    ReservationList = await Reservations.find();
  } catch (error) {
    console.log("Could not find Reservations" + error);
    res.status(500).json({ message: "Could not find Reservations" });
    return;
  }
  res.status(200).json({ ReservationList });
};

exports.getReservationsById = async (req, res, next) => {
  let ReservationList;
  const ReservationsId = req.params.pid;

  try {
    ReservationList = await Reservations.findById(ReservationsId);
  } catch (err) {
    console.log("Could not find a Reservations" + err);
  }

  if (!ReservationList) {
    const error = new HttpError(
      "Could not find a Reservations for a given id",
      404
    );
    throw error; // already cancels the function execution so no need to call 'return'
  }
  //The toObject() method is usually used in Mongoose.
  // this method is used to convert the Mongoose document to a plain JavaScript object.
  /*{ getters: true }: This is an optional parameter passed to the toObject() method. 
  When getters is set to true, it includes any virtual properties defined in the Mongoose schema as part of the resulting object. 
  Virtual properties are properties that are not stored directly in the database but are derived from other properties or computed on the fly. */
  //Here in our case to convert _id to id
  res.json({ ReservationList: ReservationList.toObject({ getters: true }) });
};

exports.getReservationsByUserId = async (req, res, next) => {
  const userID = req.params.uID;
  let Reservations;
  try {
    Reservations = await Reservations.find({ creator: userID });
  } catch (err) {
    console.log("There are no Reservations for the UID" + err);
  }

  if (!Reservations || Reservations.length === 0) {
    const error = new HttpError(
      "Could not find a Reservations for a given user id",
      404
    );
    return next(error);
  }
  res.json({
    Reservations: Reservations.map((p) => p.toObject({ getters: true })),
  });
};

exports.createReservations = async (req, res, next) => {
  console.log("make reservation");

  console.log("req body", req.body);
  //validate the request
  // const validationError = validationResult(req);
  // if (!validationError.isEmpty()) {
  //   console.log("Error in creating new Reservations");
  //   return next(
  //     new HttpError("invalid input passed please check your data", 422)
  //   ); // for async function use next() instead of throw
  // }

  //get the data from the request body
  const { name, mobileNumber, date, time, noOfGuests, seatingPreference } =
    req.body;

  // Check available tables based on the number of guests and seating preference
  let availableTable;
  // Start a session and transaction
  const sess = await mongoose.startSession();
  sess.startTransaction();

  try {
    console.log(`Checking for available tables on ${date} at ${time}`);
    availableTable = await Tables.findOne(
      {
        // available: true,
        seatingCapacity: { $gte: noOfGuests },
        seatingPreference: seatingPreference,
        reservations: {
          $not: {
            $elemMatch: { date: date, time: time },
          },
        },
      }
      // { available: false }, // Mark the table as unavailable for further reservations
      // { new: true, session: sess } // Return the updated table and use the session for the transaction
    );

    if (availableTable) {
      console.log("available", availableTable);
    }
    // If no table is found, abort the reservation process
    if (!availableTable) {
      await sess.abortTransaction(); // Abort transaction if no table is found
      sess.endSession();
      return next(
        new HttpError("No available tables matching the criteria.", 404)
      );
    }

    //create a new Reservations object
    const createdReservations = new Reservations({
      name,
      mobileNumber,
      date,
      time,
      noOfGuests,
      seatingPreference,
      assignedTable: availableTable._id,
    });
    // Save the new reservation

    await createdReservations.save({ session: sess });

    // Add the reservation details to the table's reservation list for the specific date and time

    availableTable.reservations.push({ date, time });
    availableTable.available = false;
    await availableTable.save({ session: sess });

    // Commit the transaction
    await sess.commitTransaction();

    // End the session
    sess.endSession();
    //Find a user with the given user ID
    // let user;
    // try {
    //   user = await User.findById(creator);
    // } catch (error) {
    //   console.log("Creating Reservations Failed, Please try again" + error);
    //   res
    //     .status(500)
    //     .json({ message: "Creating Reservations Failed, Please try again" });
    // }

    // if (!user) {
    //   res
    //     .status(500)
    //     .json({ message: "Could not find a user with the Given USERID" });
    //   console.log(user);
    // }
    //save the Reservations object with the data in the MONGO DB
    //Here we will do independent multiple operations. if either one operation fails, we should abort the execution of the code
    //Therefore we use sesions and transactions.
    // try {
    //   const sess = await mongoose.startSession();
    //   sess.startTransaction();
    //   //Reservations saved
    //   await createdReservations.save({ session: sess }); //Save only in this session. that's why sess parameter passed

    //Reservations ID added to our user
    //user.Reservations.push(createdReservations); //mongodb only grabs the ReservationsID and add to the Reservations array

    //save the newly updated user
    //await user.save({ session: sess });

    //   await sess.commitTransaction();
    // } catch (err) {
    //   const error = new HttpError("creating Reservations failed", 500);
    //   return next(error);
    // }

    res.status(200).json({
      Reservations: createdReservations,
      status: "Success",
      assignedTable: {
        tableId: availableTable._id, // Ensure this is the same ObjectId as assignedTable in the reservation
        seatingCapacity: availableTable.seatingCapacity,
        seatingPreference: availableTable.seatingPreference,
        date: date,
        time: time,
      },
    });
  } catch (err) {
    // If any error occurs, abort the transaction and return an error response
    await sess.abortTransaction();
    return next(new HttpError("Reservation process failed.", 500));
  } finally {
    sess.endSession(); // Ensure the session ends in all scenarios
  }
};

exports.updateReservations = async (req, res, next) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    console.log("Error in updating Reservations");
    throw new HttpError("invalid input passed please check your data", 422);
  }
  const { name, date, time } = req.body;
  const ReservationsId = req.params.pid;
  let updatedReservations;
  try {
    updatedReservations = await Reservations.findById(ReservationsId);
  } catch (error) {
    console.log("Error in updating");
  }

  updatedReservations.name = name;
  updatedReservations.date = date;
  updatedReservations.time = time;
  try {
    await updatedReservations.save();
    console.log("The  Reservations updated");
  } catch (error) {
    console.log("Could not update Reservations" + error);
    res.status(500).json({ message: "Could not update Reservations" });
    return;
  }

  res
    .status(200)
    .json({ Reservations: updatedReservations.toObject({ getters: true }) });
};

exports.deleteReservations = async (req, res, next) => {
  const Reservationsid = req.params.pid;
  let Reservations;

  try {
    Reservations = await Reservations.findById(Reservationsid).populate(
      "Table"
    ); //populate() method is used to retrieve referenced data from another collection. In this case, it seems like the creator field of the Reservations document is referencing data from another collection (e.g., a User collection). By using populate('creator'), the code will automatically fetch the referenced data from the User collection and attach it to the retrieved Reservations document.
    console.log(Reservations);
  } catch (error) {
    console.log("Somehting went wrong");
  }

  if (!Reservations) {
    // If Reservations is null or undefined, it means the document was not found.
    console.log("Reservations not found");
    res.status(404).json({ message: "Reservations not found" });
    return;
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Reservations.remove({ session: sess });
    //remove Reservations from user
    Reservations.creator.Reservations.pull(Reservations);
    await Reservations.creator.save({ session: sess });
    await sess.commitTransaction();
    console.log("Reservations removed");
  } catch (error) {
    console.log("Could not delete Reservations" + error);
    res.status(500).json({ message: "Could not delete Reservations" });
    return;
  }
  res.status(200).json({ message: "Delete the  Reservations" });
};
