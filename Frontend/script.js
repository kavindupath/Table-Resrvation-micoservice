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
        console.log("Response", response);
        // Check if the server response is successful
        if (!response.ok) {
          // throw new Error("Network response was not ok");
          alert("No available tables matching the criteria.");
          window.location.href = "reservation_unavailable.html";
          return;
        }

        // else {
        //   //queryParams = new URLSearchParams(response).toString();
        //   window.location.href = "reservation_confirmation.html";
        //   alert("Reservation success");
        // }
        return response.json(); // Convert the response to JSON
      })
      .then((data) => {
        // If `data` is received successfully, create queryParams
        if (data) {
          // Convert the data object to query parameters
          // Extract relevant fields from the response
          const {
            name,
            mobileNumber,
            date,
            time,
            noOfGuests,
            seatingPreference,
            assignedTable,
          } = data.Reservations;

          // Prepare data to pass as query parameters
          const queryParams = new URLSearchParams({
            name,
            mobileNumber,
            date,
            time,
            noOfGuests,
            seatingPreference,
            assignedTable,
          }).toString();

          // Redirect to the confirmation page with the query parameters
          alert("Reservation success");
          window.location.href = `reservation_confirmation.html?${queryParams}`;
        }
      })
      .catch((error) => {
        // Handle network errors or unexpected responses
        console.error("Error:", error.message);
        // alert(error);
        submitButton.disabled = false;
        submitButton.textContent = "Reserve Table";
      });
  });
