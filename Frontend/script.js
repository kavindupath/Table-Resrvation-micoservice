document
  .getElementById("reservation-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form values
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guests = document.getElementById("guests").value;
    const seating = document.getElementById("seating").value;

    // Validate inputs
    if (!name || !phone || !date || !time || !guests || !seating) {
      alert("Please fill out all fields!");
      return;
    }

    // Validate phone number as only digits allowed
    if (!/^\d+$/.test(phone)) {
      alert("Please enter a valid phone number with digits only.");
      return;
    }

    // Prepare the reservation data as a JSON object, including the phone number
    const reservationData = {
      name: name,
      mobileNumber: phone,
      date: date,
      time: time,
      noOfGuests: guests,
      seatingPreference: seating,
    };

    // Backend endpoint URL (to match your API/database endpoint)
    const endpoint = "http://localhost:3000/api/reservations/makereservation";

    // Disable the submit button to prevent multiple submissions
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    // Send the HTTP POST request to the server
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData), // Send the reservation data
    })
      .then((response) => {
        // alert(response);

        console.log("Response", response);
        // Check if the server response is successful
        if (!response.ok) {
          // throw new Error("Network response was not ok");
          alert("No available tables matching the criteria.");
          window.location.href = "reservation_failed.html";

          return;
        } else {
          window.location.href = "reservation_confirmation.html";
          alert("Reservation success");
        }
        // return response.json(); // Convert the response to JSON
      })
      .then((data) => {
        // // Enable the button again after receiving a response
        // submitButton.disabled = false;
        // submitButton.textContent = "Reserve Table";
        // window.location.href = "reservation_confirmation.html";
        // alert("Reservation success");
        // // Handle the server response
        // if (data.status === "success") {
        //   // Redirect to the confirmation page
        //   //   window.location.href = `reservation_confirmation.html?name=${encodeURIComponent(
        //   //     name
        //   //   )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
        //   //     time
        //   //   )}&guests=${encodeURIComponent(guests)}&seating=${encodeURIComponent(
        //   //     seating
        //   //   )}&reservationID=${encodeURIComponent(data.reservationID)}`;
        //   // } else if (data.status === "unavailable") {
        //   //   // Redirect to the unavailable page
        //   //   window.location.href = `reservation_unavailable.html?date=${encodeURIComponent(
        //   //     date
        //   //   )}&time=${encodeURIComponent(time)}`;
        //   // window.location.href = "reservation_confirmation.html";
        // } else if (data.status === "failed") {
        //   // Redirect to the failed page
        //   window.location.href = "reservation_failed.html";
        // }
      })
      .catch((error) => {
        // Handle network errors or unexpected responses
        console.error("Error:", error.message);
        // alert(error);
        submitButton.disabled = false;
        submitButton.textContent = "Reserve Table";
      });
  });
