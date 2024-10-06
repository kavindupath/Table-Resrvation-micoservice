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
      phone: phone,
      date: date,
      time: time,
      guests: guests,
      seating: seating,
    };

    // Backend endpoint URL (to match your API/database endpoint)
    const endpoint = "https://backend-api.com/makeReservation";

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
        // Check if the server response is successful
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Convert the response to JSON
      })
      .then((data) => {
        // Enable the button again after receiving a response
        submitButton.disabled = false;
        submitButton.textContent = "Reserve Table";

        // Handle the server response
        if (data.status === "success") {
          // Redirect to the confirmation page
          window.location.href = `reservation_confirmation.html?name=${encodeURIComponent(
            name
          )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
            time
          )}&guests=${encodeURIComponent(guests)}&seating=${encodeURIComponent(
            seating
          )}&reservationID=${encodeURIComponent(data.reservationID)}`;
        } else if (data.status === "unavailable") {
          // Redirect to the unavailable page
          window.location.href = `reservation_unavailable.html?date=${encodeURIComponent(
            date
          )}&time=${encodeURIComponent(time)}`;
        } else if (data.status === "failed") {
          // Redirect to the failed page
          window.location.href = "reservation_failed.html";
        }
      })
      .catch((error) => {
        // Handle network errors or unexpected responses
        console.error("Error:", error);
        alert(
          "There was an error processing your reservation. Please try again later."
        );
        submitButton.disabled = false;
        submitButton.textContent = "Reserve Table";
      });
  });
