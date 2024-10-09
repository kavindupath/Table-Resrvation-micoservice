const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
var cors = require("cors");

const reservationsRoutes = require("./routes/reservationRoutes");
const usersRoutes = require("./routes/users-route");

const app = express();
var httpServer = require("http").createServer(app);


//parse any incoming request body and extract any json data which is in there
app.use(bodyParser.json());

// enabaling cors
app.use(cors());
app.use(express.static(path.join(__dirname, 'Frontend')));
//now this acts as express middleware
app.use("/api/reservations", reservationsRoutes);
app.use("/api/users", usersRoutes);

//error handling middleware of express
//This functin will execute if any function in the middleware have an error
app.use((error, req, res, next) => {
  if (res.headerSent) {
    // Check if response has been already sent
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: "An unexpected error ocured" || error.message });
});

//  port set
const PORT = process.env.PORT || 3000;
//httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));

mongoose
  .connect(
    "mongodb+srv://kavindupath:Mongodb%40%244k@cluster0.vhukmem.mongodb.net/HotelServiceType?retryWrites=true&w=majority"
  )
  .then(() => {
    //app.listen(5000);
    httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    console.log("mongo db connected");
  })
  .catch((err) => {
    console.log(err);
  });
