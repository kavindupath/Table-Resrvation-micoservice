const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const reservationControllers = require("../controllers/reservations-controllers.js");

router.get("/", reservationControllers.getReservations);

router.get("/:pid", reservationControllers.getReservationsById);

router.get("/user/:uID", reservationControllers.getReservationsByUserId);

//Check () is another express middleware used for validating
router.post(
  "/makereservation",
  //   [check("name").not().isEmpty(), check("email").not().isEmpty()],
  reservationControllers.createReservations
);

router.patch(
  "/:pid",
  [check("name").not().isEmpty()],
  reservationControllers.updateReservations
);

router.delete("/:pid", reservationControllers.deleteReservations);

module.exports = router;
