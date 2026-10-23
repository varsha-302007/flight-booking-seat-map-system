import { useEffect, useState } from "react";
function App() {
  const [page, setPage] = useState("home");

  const [from, setFrom] = useState("Chennai");
  const [to, setTo] = useState("Delhi");
  const [date, setDate] = useState("2026-10-10");
  const [passengers, setPassengers] = useState(1);

  const [selectedFlight, setSelectedFlight] = useState(null);
const [selectedSeat, setSelectedSeat] = useState(null);

const [bookings, setBookings] = useState([]);

const [backendFlights, setBackendFlights] = useState([]);
const [backendLoading, setBackendLoading] = useState(false);
const [backendError, setBackendError] = useState("");

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [adminFlights, setAdminFlights] = useState([
    {
      id: 1,
      flightNumber: "AI101",
      airline: "Air India",
      from: "Chennai",
      to: "Delhi",
      departure: "06:30",
      arrival: "09:25",
      duration: "2h 55m",
      price: 5000,
      seats: 18,
      totalSeats: 32,
    },
    {
      id: 2,
      flightNumber: "6E204",
      airline: "IndiGo",
      from: "Chennai",
      to: "Delhi",
      departure: "10:15",
      arrival: "13:10",
      duration: "2h 55m",
      price: 4600,
      seats: 12,
      totalSeats: 32,
    },
    {
      id: 3,
      flightNumber: "UK832",
      airline: "Vistara",
      from: "Chennai",
      to: "Delhi",
      departure: "14:40",
      arrival: "17:35",
      duration: "2h 55m",
      price: 6200,
      seats: 25,
      totalSeats: 32,
    },
    {
      id: 4,
      flightNumber: "AI543",
      airline: "Air India",
      from: "Chennai",
      to: "Delhi",
      departure: "19:20",
      arrival: "22:15",
      duration: "2h 55m",
      price: 5500,
      seats: 8,
      totalSeats: 32,
    },
  ]);

  const [bookedSeatsByFlight, setBookedSeatsByFlight] = useState({
    AI101: [
      "1B",
      "2C",
      "3A",
      "4D",
      "5B",
      "6C",
      "7A",
      "8D",
    ],
    "6E204": [
      "1A",
      "2B",
      "3C",
      "5D",
    ],
    UK832: [
      "1D",
      "2A",
      "4B",
      "6C",
      "7D",
    ],
    AI543: [
      "1A",
      "2C",
      "3B",
      "5A",
      "6D",
      "7B",
      "8C",
    ],
  });

  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    airline: "",
    from: "",
    to: "",
    departure: "",
    arrival: "",
    price: "",
  });

  const seatRows = Array.from(
    { length: 8 },
    (_, index) => index + 1
  );

  /* ================================================== */
  /* FLIGHT / SEAT HELPERS */
  /* ================================================== */
  const fetchFlightsFromBackend = async () => {
  setBackendLoading(true);
  setBackendError("");

  try {
    const response = await fetch(
      "https://skybook-api-agbx.onrender.com/api/flights"
    );

    if (!response.ok) {
      throw new Error(
        "Failed to connect to backend."
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Backend returned an error."
      );
    }

    // Convert backend field names to the names
    // expected by the React frontend.
    const flights = (data.flights || []).map((flight) => ({
      ...flight,
      from: flight.from || flight.source,
      to: flight.to || flight.destination,
    }));

    setBackendFlights(flights);
  } catch (error) {
    console.error(
      "Backend connection error:",
      error
    );

    setBackendError(
      "Unable to connect to the C++ backend."
    );
  } finally {
    setBackendLoading(false);
  }
};
  const API_URL = "https://skybook-api-agbx.onrender.com/api";

const fetchBookingsFromBackend = async () => {
  try {
    const response = await fetch(`${API_URL}/bookings`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load bookings");
    }

    const savedBookings = (data.bookings || []).map((booking) => {
      const flight = backendFlights.find(
        (f) => f.flightNumber === booking.flightNumber
      );

      return {
        ...booking,
        bookingId: `SB${booking.bookingId}`,
        backendBookingId: booking.bookingId,
        passengerName: `Passenger ${booking.passengerId}`,
        passengerPhone: "",
        passengerEmail: "",
        seat: booking.seatNumber,
        date: flight?.date || date,
        airline: flight?.airline || "Flight Operator",
        from: flight?.from || "",
        to: flight?.to || "",
      };
    });

    setBookings(savedBookings);

    const bookedSeats = {};

    (data.bookings || []).forEach((booking) => {
      if (booking.status === "Confirmed") {
        if (!bookedSeats[booking.flightNumber]) {
          bookedSeats[booking.flightNumber] = [];
        }

        bookedSeats[booking.flightNumber].push(
          booking.seatNumber
        );
      }
    });

    setBookedSeatsByFlight((current) => ({
      ...current,
      ...bookedSeats,
    }));
  } catch (error) {
    console.error("Unable to load bookings:", error);
  }
};
  const getBookedSeats = () => {
    if (!selectedFlight) {
      return [];
    }

    return (
      bookedSeatsByFlight[selectedFlight.flightNumber] || []
    );
  };

  const getOccupancyPercentage = (flight) => {
    if (!flight || flight.totalSeats === 0) {
      return 0;
    }

    const booked =
      flight.totalSeats - flight.seats;

    return Math.round(
      (booked / flight.totalSeats) * 100
    );
  };

  const getDynamicBasePrice = (flight) => {
    if (!flight) {
      return 0;
    }

    const occupancy = getOccupancyPercentage(flight);

    if (occupancy <= 25) {
      return flight.price;
    }

    if (occupancy <= 50) {
      return Math.round(flight.price * 1.1);
    }

    if (occupancy <= 75) {
      return Math.round(flight.price * 1.2);
    }

    return Math.round(flight.price * 1.3);
  };

  const getSeatPrice = (seatNumber) => {
    if (!selectedFlight) {
      return 0;
    }

    const dynamicBasePrice =
      getDynamicBasePrice(selectedFlight);

    const row = parseInt(seatNumber);

    if (row <= 6) {
      return dynamicBasePrice;
    }

    return dynamicBasePrice + 4000;
  };

  const getSeatClass = (seatNumber) => {
    const row = parseInt(seatNumber);

    if (row <= 6) {
      return "Economy";
    }

    return "Business";
  };

  /* ================================================== */
  /* SEARCH */
  /* ================================================== */

 const handleSearch = async () => {
    if (!from || !to || !date) {
        alert("Please enter the journey details.");
        return;
    }

    await fetchFlightsFromBackend();

    setPage("results");
};

  /* ================================================== */
  /* FLIGHT SELECTION */
  /* ================================================== */

  const handleSelectFlight = (flight) => {
    if (flight.seats <= 0) {
      alert("This flight is fully booked.");
      return;
    }

    setSelectedFlight(flight);
    setSelectedSeat(null);
    setPage("seatmap");
  };

  /* ================================================== */
  /* SEAT SELECTION */
  /* ================================================== */

  const handleSeatSelect = (seatNumber) => {
    const bookedSeats = getBookedSeats();

    if (bookedSeats.includes(seatNumber)) {
      return;
    }

    setSelectedSeat(seatNumber);
  };

  const continueToBooking = () => {
    if (!selectedSeat) {
      alert("Please select a seat first.");
      return;
    }

    setPage("booking");
  };

  /* ================================================== */
  /* PASSENGER DETAILS */
  /* ================================================== */

  const handlePassengerChange = (field, value) => {
    setPassengerDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* ================================================== */
  /* BOOKING */
  /* ================================================== */

  const confirmBooking = async () => {
  if (!selectedFlight || !selectedSeat) {
    return;
  }

  if (
    !passengerDetails.name.trim() ||
    !passengerDetails.phone.trim() ||
    !passengerDetails.email.trim()
  ) {
    alert("Please fill in all passenger details.");
    return;
  }

  if (passengerDetails.phone.length < 10) {
    alert("Please enter a valid phone number.");
    return;
  }

  if (!passengerDetails.email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  if (getBookedSeats().includes(selectedSeat)) {
    alert("This seat is already booked. Please choose another.");
    setSelectedSeat(null);
    setPage("seatmap");
    return;
  }

  const numericBookingId =
    1000000000 + Math.floor(Math.random() * 900000000);

  const finalPrice = getSeatPrice(selectedSeat);

  const requestBody = {
    bookingId: numericBookingId,
    passengerId: 101,
    flightNumber: selectedFlight.flightNumber,
    seatNumber: selectedSeat,
  };

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Booking failed.");
    }

    const newBooking = {
      bookingId: `SB${numericBookingId}`,
      backendBookingId: numericBookingId,
      passengerName: passengerDetails.name,
      passengerPhone: passengerDetails.phone,
      passengerEmail: passengerDetails.email,
      passengerId: "101",
      flightNumber: selectedFlight.flightNumber,
      airline: selectedFlight.airline,
      from: selectedFlight.from,
      to: selectedFlight.to,
      date: date,
      seat: selectedSeat,
      seatNumber: selectedSeat,
      seatClass: getSeatClass(selectedSeat),
      price: finalPrice,
      status: "Confirmed",
    };

    setBookings((current) => [...current, newBooking]);

    setBookedSeatsByFlight((current) => ({
      ...current,
      [selectedFlight.flightNumber]: [
        ...(current[selectedFlight.flightNumber] || []),
        selectedSeat,
      ],
    }));

    setLastBooking(newBooking);
    setBookingSuccess(true);
    setPage("confirmation");

    // Refresh the seat map from the backend.
    await fetchFlightsFromBackend();
  } catch (error) {
    console.error("Booking error:", error);
    alert(error.message || "Unable to save booking. Please try again.");
  }
};

  /* ================================================== */
  /* CANCEL BOOKING */
  /* ================================================== */

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(
      (item) => item.bookingId === bookingId
    );

    if (!booking || booking.status === "Cancelled") {
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.bookingId === bookingId
          ? {
              ...item,
              status: "Cancelled",
            }
          : item
      )
    );

    /* Make the seat available again */

    setBookedSeatsByFlight((current) => ({
      ...current,
      [booking.flightNumber]: (
        current[booking.flightNumber] || []
      ).filter(
        (seat) => seat !== booking.seat
      ),
    }));

    /* Increase available seats */

    setAdminFlights((currentFlights) =>
      currentFlights.map((flight) =>
        flight.flightNumber ===
        booking.flightNumber
          ? {
              ...flight,
              seats: Math.min(
                flight.totalSeats,
                flight.seats + 1
              ),
            }
          : flight
      )
    );
  };

  /* ================================================== */
  /* ADMIN */
  /* ================================================== */

  const handleNewFlightChange = (
    field,
    value
  ) => {
    setNewFlight((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addFlight = () => {
    if (
      !newFlight.flightNumber ||
      !newFlight.airline ||
      !newFlight.from ||
      !newFlight.to ||
      !newFlight.departure ||
      !newFlight.arrival ||
      !newFlight.price
    ) {
      alert("Please fill in all flight details.");
      return;
    }

    const flightNumberExists =
      adminFlights.some(
        (flight) =>
          flight.flightNumber.toLowerCase() ===
          newFlight.flightNumber.toLowerCase()
      );

    if (flightNumberExists) {
      alert("This flight number already exists.");
      return;
    }

    const flight = {
      id: Date.now(),
      flightNumber:
        newFlight.flightNumber.toUpperCase(),
      airline: newFlight.airline,
      from: newFlight.from,
      to: newFlight.to,
      departure: newFlight.departure,
      arrival: newFlight.arrival,
      duration: "2h 55m",
      price: Number(newFlight.price),
      seats: 32,
      totalSeats: 32,
    };

    setAdminFlights((currentFlights) => [
      ...currentFlights,
      flight,
    ]);

    setBookedSeatsByFlight((current) => ({
      ...current,
      [flight.flightNumber]: [],
    }));

    setNewFlight({
      flightNumber: "",
      airline: "",
      from: "",
      to: "",
      departure: "",
      arrival: "",
      price: "",
    });

    alert("Flight added successfully.");
  };

  const removeFlight = (flightId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this flight?"
    );

    if (!confirmed) {
      return;
    }

    const flightToRemove =
      adminFlights.find(
        (flight) => flight.id === flightId
      );

    setAdminFlights((currentFlights) =>
      currentFlights.filter(
        (flight) => flight.id !== flightId
      )
    );

    if (flightToRemove) {
      setBookedSeatsByFlight((current) => {
        const updated = {
          ...current,
        };

        delete updated[
          flightToRemove.flightNumber
        ];

        return updated;
      });
    }

    if (
      selectedFlight &&
      selectedFlight.id === flightId
    ) {
      setSelectedFlight(null);
      setSelectedSeat(null);
      setPage("results");
    }
  };

  /* ================================================== */
  /* ADMIN STATISTICS */
  /* ================================================== */

  const totalSeats = adminFlights.reduce(
    (sum, flight) =>
      sum + flight.totalSeats,
    0
  );

  const availableSeats = adminFlights.reduce(
    (sum, flight) =>
      sum + flight.seats,
    0
  );

  const totalRevenue = bookings
    .filter(
      (booking) =>
        booking.status === "Confirmed"
    )
    .reduce(
      (sum, booking) =>
        sum + booking.price,
      0
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================================================== */}
      {/* NAVBAR */}
      {/* ================================================== */}

      <nav className="border-b border-slate-800 bg-slate-950/95">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">

          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              ✈️
            </div>

            <div className="text-left">

              <h1 className="text-xl font-bold">
                SkyBook
              </h1>

              <p className="text-xs text-slate-400">
                Flight Booking System
              </p>

            </div>

          </button>


          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">

            <button
              onClick={() => setPage("home")}
              className="hidden text-sm text-slate-300 transition hover:text-white sm:block"
            >
              Home
            </button>


            <button
              onClick={() => setPage("results")}
              className="hidden text-sm text-slate-400 transition hover:text-white sm:block"
            >
              Flights
            </button>


            <button
              onClick={() => setPage("bookings")}
              className="hidden text-sm text-slate-400 transition hover:text-white sm:block"
            >
              My Bookings
            </button>


            <button
              onClick={() => setPage("admin")}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 sm:px-5"
            >
              Admin
            </button>

          </div>

        </div>

      </nav>


      {/* ================================================== */}
      {/* HOME */}
      {/* ================================================== */}

      {page === "home" && (

        <main>

          <section className="relative overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-slate-950" />

            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 md:pb-24 md:pt-20">

              <div className="max-w-3xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                  ✨ Simple. Smart. Seamless.
                </div>


                <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">

                  Your journey

                  <span className="block text-blue-500">
                    starts here.
                  </span>

                </h2>


                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">

                  Search flights, choose your perfect seat,
                  and manage your bookings — all in one place.

                </p>

              </div>


              {/* SEARCH CARD */}

              <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl sm:mt-12 sm:p-6">

                <div className="mb-6">

                  <h3 className="text-xl font-bold">
                    Search Flights
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Find the perfect flight for your journey
                  </p>

                </div>


                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <SearchInput
                    label="From"
                    value={from}
                    onChange={setFrom}
                  />

                  <SearchInput
                    label="To"
                    value={to}
                    onChange={setTo}
                  />

                  <SearchInput
                    label="Travel Date"
                    type="date"
                    value={date}
                    onChange={setDate}
                  />

                  <SearchInput
                    label="Passengers"
                    type="number"
                    min="1"
                    max="10"
                    value={passengers}
                    onChange={setPassengers}
                  />

                </div>


                <button
                  onClick={handleSearch}
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-4 font-bold transition hover:bg-blue-500"
                >
                  Search Flights →
                </button>

              </div>

            </div>

          </section>


          {/* FEATURES */}

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">

            <div className="mb-10 text-center md:mb-12">

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                Everything you need
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                A better way to manage your journey
              </h3>

            </div>


            <div className="grid gap-6 md:grid-cols-3">

              <FeatureCard
                icon="💺"
                title="Smart Seat Selection"
                description="View the complete seat map and choose your preferred available seat."
              />

              <FeatureCard
                icon="💰"
                title="Dynamic Pricing"
                description="Prices automatically adjust based on flight occupancy."
              />

              <FeatureCard
                icon="🎫"
                title="Easy Booking"
                description="Create, view, and cancel bookings through a simple interface."
              />

            </div>

          </section>

        </main>
      )}


      {/* ================================================== */}
      {/* FLIGHT RESULTS */}
      {/* ================================================== */}

      {page === "results" && (

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">

          <button
            onClick={() => setPage("home")}
            className="mb-8 text-sm text-slate-400 hover:text-white"
          >
            ← Back to Search
          </button>


          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Available Flights
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              {from} → {to}
            </h2>

            <p className="mt-3 text-slate-400">
              {date} • {passengers} passenger(s)
            </p>

          </div>


          <div className="space-y-5">

            {backendFlights.map((flight) => {

              const occupancy =
                getOccupancyPercentage(flight);

              const dynamicPrice =
                getDynamicBasePrice(flight);

              return (

                <div
                  key={flight.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/50 sm:p-6"
                >

                  <div className="grid gap-6 lg:grid-cols-5">

                    <div>

                      <p className="text-lg font-bold">
                        {flight.airline}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {flight.flightNumber}
                      </p>

                    </div>


                    <div>

                      <p className="text-2xl font-bold">
                        {flight.departure}
                      </p>

                      <p className="text-sm text-slate-400">
                        {flight.from}
                      </p>

                    </div>


                    <div className="text-center">

                      <p className="text-sm text-slate-400">
                        {flight.duration}
                      </p>

                      <div className="my-2 flex items-center">

                        <div className="h-px flex-1 bg-slate-700" />

                        <span className="px-3 text-blue-500">
                          ✈
                        </span>

                        <div className="h-px flex-1 bg-slate-700" />

                      </div>

                      <p className="text-xs text-slate-500">
                        Non-stop
                      </p>

                    </div>


                    <div>

                      <p className="text-2xl font-bold">
                        {flight.arrival}
                      </p>

                      <p className="text-sm text-slate-400">
                        {flight.to}
                      </p>

                    </div>


                    <div className="lg:text-right">

                      <p className="text-xs text-slate-500">
                        Current fare
                      </p>

                      <p className="text-2xl font-bold text-blue-400">
                        ₹{dynamicPrice.toLocaleString()}
                      </p>

                      {dynamicPrice !==
                        flight.price && (

                        <p className="mt-1 text-xs text-amber-400">
                          Dynamic pricing active
                        </p>

                      )}

                      <p className="mt-2 text-xs text-slate-500">
                        {flight.seats} seats available
                        {" • "}
                        {occupancy}% occupied
                      </p>
                      {backendLoading && (
    <p className="mt-4 text-blue-400">
        Loading flights from C++ backend...
    </p>
)}

{backendError && (
    <p className="mt-4 text-red-400">
        {backendError}
    </p>
)}

{!backendLoading &&
    !backendError &&
    backendFlights.length > 0 && (
        <p className="mt-4 text-green-400">
            ✓ Connected to C++ backend
        </p>
    )}

                      <button
                        onClick={() =>
                          handleSelectFlight(flight)
                        }
                        className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                      >
                        Select Flight
                      </button>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        </main>
      )}


      {/* ================================================== */}
      {/* SEAT MAP */}
      {/* ================================================== */}

      {page === "seatmap" && selectedFlight && (

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">

          <button
            onClick={() => setPage("results")}
            className="mb-8 text-sm text-slate-400 hover:text-white"
          >
            ← Back to Flights
          </button>


          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Seat Selection
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Choose your seat
            </h2>

            <p className="mt-3 text-slate-400">
              {selectedFlight.airline} •{" "}
              {selectedFlight.flightNumber}
              {" • "}
              {selectedFlight.from} →{" "}
              {selectedFlight.to}
            </p>

          </div>


          <div className="grid gap-8 lg:grid-cols-3">

            <div className="lg:col-span-2">

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-8">

                <div className="mx-auto mb-8 max-w-md">

                  <div className="rounded-t-[50%] border border-slate-700 bg-slate-800 px-8 py-5 text-center">

                    <span className="text-sm font-semibold text-slate-400">
                      ✈ COCKPIT
                    </span>

                  </div>

                </div>


                <div className="mb-8 flex flex-wrap justify-center gap-5 text-sm">

                  <Legend
                    className="bg-slate-700"
                    text="Available"
                  />

                  <Legend
                    className="bg-red-500"
                    text="Booked"
                  />

                  <Legend
                    className="bg-blue-500"
                    text="Selected"
                  />

                </div>


                <div className="mb-10">

                  <div className="mb-5 flex items-center gap-3">

                    <h3 className="text-xl font-bold">
                      Economy
                    </h3>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                      Rows 1–6
                    </span>

                  </div>


                  <div className="space-y-3">

                    {seatRows
                      .slice(0, 6)
                      .map((row) => (

                        <SeatRow
                          key={row}
                          row={row}
                          bookedSeats={getBookedSeats()}
                          selectedSeat={selectedSeat}
                          onSeatSelect={
                            handleSeatSelect
                          }
                        />

                      ))}

                  </div>

                </div>


                <div>

                  <div className="mb-5 flex items-center gap-3">

                    <h3 className="text-xl font-bold">
                      Business
                    </h3>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                      Rows 7–8
                    </span>

                  </div>


                  <div className="space-y-3">

                    {seatRows
                      .slice(6, 8)
                      .map((row) => (

                        <SeatRow
                          key={row}
                          row={row}
                          bookedSeats={getBookedSeats()}
                          selectedSeat={selectedSeat}
                          onSeatSelect={
                            handleSeatSelect
                          }
                        />

                      ))}

                  </div>

                </div>


                <div className="mx-auto mt-8 max-w-md">

                  <div className="rounded-b-2xl border border-slate-700 bg-slate-800 py-3 text-center">

                    <span className="text-xs text-slate-500">
                      REAR OF AIRCRAFT
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* PRICE PANEL */}

            <div>

              <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h3 className="text-xl font-bold">
                  Your Selection
                </h3>


                <div className="mt-6 space-y-5">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Flight
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedFlight.flightNumber}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Route
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedFlight.from} →{" "}
                      {selectedFlight.to}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Travel Date
                    </p>

                    <p className="mt-1 font-semibold">
                      {date}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Occupancy
                    </p>

                    <p className="mt-1 font-semibold text-blue-400">
                      {getOccupancyPercentage(
                        selectedFlight
                      )}
                      %
                    </p>

                  </div>


                  <div className="border-t border-slate-800 pt-5">

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Selected Seat
                    </p>


                    {selectedSeat ? (

                      <div className="mt-3 flex items-center justify-between">

                        <div>

                          <p className="text-2xl font-bold text-blue-400">
                            {selectedSeat}
                          </p>

                          <p className="text-sm text-slate-400">
                            {getSeatClass(
                              selectedSeat
                            )}
                          </p>

                        </div>


                        <p className="text-xl font-bold">
                          ₹
                          {getSeatPrice(
                            selectedSeat
                          ).toLocaleString()}
                        </p>

                      </div>

                    ) : (

                      <p className="mt-2 text-sm text-slate-500">
                        No seat selected
                      </p>

                    )}

                  </div>


                  <div className="border-t border-slate-800 pt-5">

                    <div className="flex justify-between">

                      <span className="text-slate-400">
                        Base fare
                      </span>

                      <span>
                        ₹
                        {getDynamicBasePrice(
                          selectedFlight
                        ).toLocaleString()}
                      </span>

                    </div>


                    {selectedSeat &&
                      getSeatClass(selectedSeat) ===
                        "Business" && (

                        <div className="mt-2 flex justify-between text-sm">

                          <span className="text-slate-400">
                            Business upgrade
                          </span>

                          <span>
                            ₹4,000
                          </span>

                        </div>

                      )}


                    <div className="mt-4 flex justify-between border-t border-slate-800 pt-4">

                      <span className="font-bold">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-blue-400">

                        ₹
                        {selectedSeat
                          ? getSeatPrice(
                              selectedSeat
                            ).toLocaleString()
                          : getDynamicBasePrice(
                              selectedFlight
                            ).toLocaleString()}

                      </span>

                    </div>

                  </div>


                  <button
                    onClick={continueToBooking}
                    className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold transition hover:bg-blue-500"
                  >
                    Continue to Booking →
                  </button>

                </div>

              </div>

            </div>

          </div>

        </main>
      )}


      {/* ================================================== */}
      {/* BOOKING REVIEW */}
      {/* ================================================== */}

      {page === "booking" &&
        selectedFlight &&
        selectedSeat && (

          <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">

            <button
              onClick={() => setPage("seatmap")}
              className="mb-8 text-sm text-slate-400 hover:text-white"
            >
              ← Back to Seat Selection
            </button>


            <div className="mb-10 text-center">

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                Passenger Details
              </p>

              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Complete your booking
              </h2>

              <p className="mt-3 text-slate-400">
                Enter passenger details and review your flight.
              </p>

            </div>


            {/* PASSENGER FORM */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">

              <h3 className="text-xl font-bold">
                Passenger Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These details will be associated with your booking.
              </p>


              <div className="mt-6 grid gap-5 md:grid-cols-3">

                <FormInput
                  label="Full Name"
                  placeholder="Enter passenger name"
                  value={passengerDetails.name}
                  onChange={(value) =>
                    handlePassengerChange(
                      "name",
                      value
                    )
                  }
                />


                <FormInput
                  label="Phone Number"
                  placeholder="10-digit mobile number"
                  type="tel"
                  value={passengerDetails.phone}
                  onChange={(value) =>
                    handlePassengerChange(
                      "phone",
                      value
                    )
                  }
                />


                <FormInput
                  label="Email Address"
                  placeholder="example@email.com"
                  type="email"
                  value={passengerDetails.email}
                  onChange={(value) =>
                    handlePassengerChange(
                      "email",
                      value
                    )
                  }
                />

              </div>

            </div>


            {/* REVIEW */}

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">

              <h3 className="text-xl font-bold">
                Booking Summary
              </h3>


              <div className="mt-6 grid gap-6 md:grid-cols-2">

                <Detail
                  label="Passenger"
                  value={
                    passengerDetails.name ||
                    "Not entered"
                  }
                />

                <Detail
                  label="Flight"
                  value={`${selectedFlight.airline} • ${selectedFlight.flightNumber}`}
                />

                <Detail
                  label="Route"
                  value={`${selectedFlight.from} → ${selectedFlight.to}`}
                />

                <Detail
                  label="Travel Date"
                  value={date}
                />

                <Detail
                  label="Seat"
                  value={`${selectedSeat} • ${getSeatClass(selectedSeat)}`}
                />

                <Detail
                  label="Fare"
                  value={`₹${getSeatPrice(
                    selectedSeat
                  ).toLocaleString()}`}
                />

              </div>


              <div className="mt-8 border-t border-slate-800 pt-8">

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm text-slate-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-400">
                      ₹
                      {getSeatPrice(
                        selectedSeat
                      ).toLocaleString()}
                    </p>

                  </div>


                  <button
                    onClick={confirmBooking}
                    className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
                  >
                    ✓ Confirm Booking
                  </button>

                </div>

              </div>

            </div>

          </main>
        )}


      {/* ================================================== */}
      {/* CONFIRMATION */}
      {/* ================================================== */}

      {page === "confirmation" &&
        bookingSuccess &&
        lastBooking && (

          <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">

            <div className="text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-4xl text-green-400">
                ✓
              </div>


              <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-green-400">
                Booking Confirmed
              </p>


              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Your flight is booked!
              </h2>


              <p className="mt-3 text-slate-400">
                Your booking has been successfully created.
              </p>

            </div>


            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">

              <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Booking ID
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-400">
                    {lastBooking.bookingId}
                  </p>

                </div>


                <span className="w-fit rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                  {lastBooking.status}
                </span>

              </div>


              <div className="grid gap-6 md:grid-cols-2">

                <Detail
                  label="Passenger"
                  value={lastBooking.passengerName}
                />

                <Detail
                  label="Phone"
                  value={lastBooking.passengerPhone}
                />

                <Detail
                  label="Email"
                  value={lastBooking.passengerEmail}
                />

                <Detail
                  label="Flight"
                  value={`${lastBooking.airline} • ${lastBooking.flightNumber}`}
                />

                <Detail
                  label="Route"
                  value={`${lastBooking.from} → ${lastBooking.to}`}
                />

                <Detail
                  label="Travel Date"
                  value={lastBooking.date}
                />

                <Detail
                  label="Seat"
                  value={`${lastBooking.seat} • ${lastBooking.seatClass}`}
                />

                <Detail
                  label="Amount Paid"
                  value={`₹${lastBooking.price.toLocaleString()}`}
                />

              </div>


              <div className="mt-10 grid gap-4 sm:grid-cols-2">

                <button
                  onClick={() => setPage("bookings")}
                  className="rounded-xl bg-blue-600 px-5 py-4 font-bold transition hover:bg-blue-500"
                >
                  View My Bookings
                </button>


                <button
                  onClick={() => setPage("home")}
                  className="rounded-xl border border-slate-700 px-5 py-4 font-bold transition hover:bg-slate-800"
                >
                  Back to Home
                </button>

              </div>

            </div>

          </main>
        )}


      {/* ================================================== */}
      {/* MY BOOKINGS */}
      {/* ================================================== */}

      {page === "bookings" && (

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">

          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              My Account
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              My Bookings
            </h2>

            <p className="mt-3 text-slate-400">
              View and manage your flight bookings.
            </p>

          </div>


          {bookings.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

              <div className="text-5xl">
                🎫
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                No bookings yet
              </h3>

              <p className="mt-2 text-slate-400">
                Search for a flight and make your first booking.
              </p>


              <button
                onClick={() => setPage("home")}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Search Flights
              </button>

            </div>

          ) : (

            <div className="space-y-5">

              {bookings.map((booking) => (

                <div
                  key={booking.bookingId}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <p className="text-xl font-bold">
                          {booking.flightNumber}
                        </p>

                        <span
                          className={
                            booking.status ===
                            "Confirmed"
                              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400"
                              : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400"
                          }
                        >
                          {booking.status}
                        </span>

                      </div>


                      <p className="mt-2 text-slate-400">
                        {booking.airline}
                      </p>

                      <p className="mt-3 text-lg font-semibold">
                        {booking.from} → {booking.to}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Passenger:{" "}
                        {booking.passengerName}
                      </p>

                    </div>


                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">

                      <BookingInfo
                        label="Booking ID"
                        value={booking.bookingId}
                      />

                      <BookingInfo
                        label="Date"
                        value={booking.date}
                      />

                      <BookingInfo
                        label="Seat"
                        value={booking.seat}
                      />

                      <BookingInfo
                        label="Price"
                        value={`₹${booking.price.toLocaleString()}`}
                      />

                    </div>


                    <div>

                      {booking.status ===
                      "Confirmed" ? (

                        <button
                          onClick={() =>
                            cancelBooking(
                              booking.bookingId
                            )
                          }
                          className="rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                          Cancel Booking
                        </button>

                      ) : (

                        <span className="text-sm text-slate-500">
                          Booking cancelled
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </main>
      )}


      {/* ================================================== */}
      {/* ADMIN DASHBOARD */}
      {/* ================================================== */}

      {page === "admin" && (

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12">

          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                Administration
              </p>

              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Admin Dashboard
              </h2>

              <p className="mt-3 text-slate-400">
                Manage flights and monitor the booking system.
              </p>

            </div>


            <button
              onClick={() => setPage("home")}
              className="w-fit rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800"
            >
              ← Passenger View
            </button>

          </div>


          {/* STAT CARDS */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <AdminStat
              icon="✈️"
              title="Total Flights"
              value={adminFlights.length}
              description="Currently available"
            />

            <AdminStat
              icon="💺"
              title="Available Seats"
              value={availableSeats}
              description={`Out of ${totalSeats} total seats`}
            />

            <AdminStat
              icon="🎫"
              title="Bookings"
              value={bookings.length}
              description="All passenger bookings"
            />

            <AdminStat
              icon="₹"
              title="Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              description="Confirmed bookings"
            />

          </div>


          {/* ADD FLIGHT */}

          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

            <div className="mb-6">

              <h3 className="text-xl font-bold">
                Add New Flight
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Add a new flight to the SkyBook system.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <AdminInput
                label="Flight Number"
                placeholder="e.g. AI202"
                value={newFlight.flightNumber}
                onChange={(value) =>
                  handleNewFlightChange(
                    "flightNumber",
                    value
                  )
                }
              />


              <AdminInput
                label="Airline"
                placeholder="e.g. Air India"
                value={newFlight.airline}
                onChange={(value) =>
                  handleNewFlightChange(
                    "airline",
                    value
                  )
                }
              />


              <AdminInput
                label="From"
                placeholder="e.g. Chennai"
                value={newFlight.from}
                onChange={(value) =>
                  handleNewFlightChange(
                    "from",
                    value
                  )
                }
              />


              <AdminInput
                label="To"
                placeholder="e.g. Mumbai"
                value={newFlight.to}
                onChange={(value) =>
                  handleNewFlightChange(
                    "to",
                    value
                  )
                }
              />


              <AdminInput
                label="Departure"
                type="time"
                value={newFlight.departure}
                onChange={(value) =>
                  handleNewFlightChange(
                    "departure",
                    value
                  )
                }
              />


              <AdminInput
                label="Arrival"
                type="time"
                value={newFlight.arrival}
                onChange={(value) =>
                  handleNewFlightChange(
                    "arrival",
                    value
                  )
                }
              />


              <AdminInput
                label="Base Price"
                type="number"
                placeholder="e.g. 5500"
                value={newFlight.price}
                onChange={(value) =>
                  handleNewFlightChange(
                    "price",
                    value
                  )
                }
              />


              <div className="flex items-end">

                <button
                  onClick={addFlight}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + Add Flight
                </button>

              </div>

            </div>

          </section>


          {/* FLIGHT MANAGEMENT */}

          <section className="mt-10">

            <div className="mb-5">

              <h3 className="text-2xl font-bold">
                Flight Management
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                View, monitor and remove flights.
              </p>

            </div>


            <div className="overflow-x-auto rounded-2xl border border-slate-800">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-900">

                  <tr className="border-b border-slate-800">

                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                      Flight
                    </th>

                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                      Route
                    </th>

                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                      Schedule
                    </th>

                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-slate-500">
                      Availability
                    </th>

                    <th className="px-5 py-4 text-right text-xs uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {adminFlights.map((flight) => {

                    const occupancy =
                      getOccupancyPercentage(
                        flight
                      );

                    return (

                      <tr
                        key={flight.id}
                        className="border-b border-slate-800 bg-slate-950 transition hover:bg-slate-900"
                      >

                        <td className="px-5 py-5">

                          <p className="font-bold">
                            {flight.flightNumber}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {flight.airline}
                          </p>

                        </td>


                        <td className="px-5 py-5">

                          <p className="font-medium">
                            {flight.from} → {flight.to}
                          </p>

                        </td>


                        <td className="px-5 py-5">

                          <p className="font-medium">
                            {flight.departure} -{" "}
                            {flight.arrival}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {flight.duration}
                          </p>

                        </td>


                        <td className="px-5 py-5">

                          <p className="font-bold text-blue-400">
                            ₹
                            {getDynamicBasePrice(
                              flight
                            ).toLocaleString()}
                          </p>

                        </td>


                        <td className="px-5 py-5">

                          <div className="w-36">

                            <div className="mb-2 flex justify-between text-xs">

                              <span className="text-slate-400">
                                {flight.seats} available
                              </span>

                              <span className="text-slate-500">
                                {occupancy}%
                              </span>

                            </div>


                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${occupancy}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-5 text-right">

                          <button
                            onClick={() =>
                              removeFlight(
                                flight.id
                              )
                            }
                            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                          >
                            Remove
                          </button>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          </section>


          {/* RECENT BOOKINGS */}

          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

            <div className="mb-6">

              <h3 className="text-xl font-bold">
                Recent Bookings
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Overview of passenger bookings.
              </p>

            </div>


            {bookings.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">

                <p className="text-slate-500">
                  No bookings have been created yet.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {bookings.map((booking) => (

                  <div
                    key={booking.bookingId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                  >

                    <div>

                      <p className="font-bold">
                        {booking.bookingId}
                      </p>

                      <p className="text-sm text-slate-400">
                        {booking.passengerName} •{" "}
                        {booking.flightNumber} • Seat{" "}
                        {booking.seat}
                      </p>

                    </div>


                    <div className="flex items-center gap-5">

                      <p className="font-semibold">
                        ₹
                        {booking.price.toLocaleString()}
                      </p>

                      <span
                        className={
                          booking.status ===
                          "Confirmed"
                            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400"
                            : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400"
                        }
                      >
                        {booking.status}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </main>
      )}


      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <footer className="border-t border-slate-800 py-8">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-slate-500 sm:px-6 md:flex-row">

          <p>
            © 2026 SkyBook Flight Booking System
          </p>

          <p>
            Built with React + C++
          </p>

        </div>

      </footer>

    </div>
  );
}


/* ================================================== */
/* SEARCH INPUT */
/* ================================================== */

function SearchInput({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
      />

    </div>

  );
}


/* ================================================== */
/* FORM INPUT */
/* ================================================== */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
      />

    </div>

  );
}


/* ================================================== */
/* ADMIN INPUT */
/* ================================================== */

function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
      />

    </div>

  );
}


/* ================================================== */
/* ADMIN STAT */
/* ================================================== */

function AdminStat({
  icon,
  title,
  value,
  description,
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

        </div>


        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
          {icon}
        </div>

      </div>


      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>

  );
}


/* ================================================== */
/* SEAT ROW */
/* ================================================== */

function SeatRow({
  row,
  bookedSeats,
  selectedSeat,
  onSeatSelect,
}) {

  return (

    <div className="flex items-center justify-center gap-2 sm:gap-3">

      <span className="w-5 text-center text-xs text-slate-500 sm:w-6">
        {row}
      </span>


      <SeatButton
        seat={`${row}A`}
        booked={bookedSeats.includes(
          `${row}A`
        )}
        selected={
          selectedSeat === `${row}A`
        }
        onClick={() =>
          onSeatSelect(`${row}A`)
        }
      />


      <SeatButton
        seat={`${row}B`}
        booked={bookedSeats.includes(
          `${row}B`
        )}
        selected={
          selectedSeat === `${row}B`
        }
        onClick={() =>
          onSeatSelect(`${row}B`)
        }
      />


      <div className="w-4 sm:w-6" />


      <SeatButton
        seat={`${row}C`}
        booked={bookedSeats.includes(
          `${row}C`
        )}
        selected={
          selectedSeat === `${row}C`
        }
        onClick={() =>
          onSeatSelect(`${row}C`)
        }
      />


      <SeatButton
        seat={`${row}D`}
        booked={bookedSeats.includes(
          `${row}D`
        )}
        selected={
          selectedSeat === `${row}D`
        }
        onClick={() =>
          onSeatSelect(`${row}D`)
        }
      />

    </div>

  );
}


/* ================================================== */
/* SEAT BUTTON */
/* ================================================== */

function SeatButton({
  seat,
  booked,
  selected,
  onClick,
}) {

  let className =
    "flex h-10 w-10 items-center justify-center rounded-lg border text-[10px] font-bold transition sm:h-11 sm:w-11 sm:text-xs ";

  if (booked) {

    className +=
      "cursor-not-allowed border-red-500/30 bg-red-500 text-white";

  } else if (selected) {

    className +=
      "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/30";

  } else {

    className +=
      "border-slate-600 bg-slate-700 text-slate-200 hover:border-blue-400 hover:bg-blue-500/20";

  }

  return (

    <button
      onClick={onClick}
      disabled={booked}
      className={className}
    >
      {booked ? "×" : seat}
    </button>

  );
}


/* ================================================== */
/* LEGEND */
/* ================================================== */

function Legend({
  className,
  text,
}) {

  return (

    <div className="flex items-center gap-2">

      <div
        className={`h-4 w-4 rounded ${className}`}
      />

      <span className="text-slate-400">
        {text}
      </span>

    </div>

  );
}


/* ================================================== */
/* DETAIL */
/* ================================================== */

function Detail({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold">
        {value}
      </p>

    </div>

  );
}


/* ================================================== */
/* BOOKING INFO */
/* ================================================== */

function BookingInfo({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

    </div>

  );
}


/* ================================================== */
/* FEATURE CARD */
/* ================================================== */

function FeatureCard({
  icon,
  title,
  description,
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:-translate-y-1 hover:border-blue-500/50">

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
        {icon}
      </div>

      <h4 className="text-xl font-bold">
        {title}
      </h4>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>

    </div>

  );
}


export default App;
