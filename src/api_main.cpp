#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cctype>

#include "Flight.h"
#include "Booking.h"
#include "FileManager.h"

using namespace std;

string escapeJson(const string& value)
{
    string result;

    for (char c : value)
    {
        switch (c)
        {
            case '"': result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\n': result += "\\n"; break;
            case '\r': result += "\\r"; break;
            case '\t': result += "\\t"; break;
            default: result += c;
        }
    }

    return result;
}

string getArg(int argc, char* argv[], const string& key)
{
    for (int i = 1; i + 1 < argc; i++)
        if (argv[i] == key)
            return argv[i + 1];

    return "";
}

int getIntArg(int argc, char* argv[], const string& key)
{
    string value = getArg(argc, argv, key);

    try { return stoi(value); }
    catch (...) { return 0; }
}

void printError(const string& message)
{
    cout << "{\"success\":false,\"message\":\""
         << escapeJson(message) << "\"}";
}

int main(int argc, char* argv[])
{
    FileManager fm;

    vector<Flight> flights = fm.loadFlights();
    vector<Booking> bookings = fm.loadBookings();

    // Create the demonstration flight if no flight data exists.
    if (flights.empty())
    {
        Flight f("AI101", "Chennai", "Delhi", "10-10-2026");

        for (int row = 1; row <= 6; row++)
        {
            for (char col = 'A'; col <= 'D'; col++)
                f.addSeat(Seat(to_string(row) + col, "Economy", 5000));
        }

        for (int row = 7; row <= 8; row++)
        {
            for (char col = 'A'; col <= 'D'; col++)
                f.addSeat(Seat(to_string(row) + col, "Business", 9000));
        }

        flights.push_back(f);
        fm.saveFlights(flights);
    }

    // Restore confirmed bookings to the in-memory seat maps.
    for (Flight& flight : flights)
    {
        for (const Booking& booking : bookings)
        {
            if (booking.getStatus() != "Confirmed" ||
                booking.getFlightNumber() != flight.getFlightNumber())
                continue;

            Seat* seat = flight.findSeat(booking.getSeatNumber());

            if (seat != nullptr && !seat->isBooked())
                seat->bookSeat();
        }
    }

    string action = getArg(argc, argv, "--action");

    if (action == "book")
    {
        string flightNumber = getArg(argc, argv, "--flight");
        string seatNumber = getArg(argc, argv, "--seat");
        int passengerId = getIntArg(argc, argv, "--passenger");
        int bookingId = getIntArg(argc, argv, "--id");

        Flight* selected = nullptr;

        for (Flight& flight : flights)
            if (flight.getFlightNumber() == flightNumber)
                selected = &flight;

        if (selected == nullptr || seatNumber.empty() ||
            passengerId <= 0 || bookingId <= 0)
        {
            printError("Invalid flight, seat, passenger, or booking ID.");
            return 0;
        }

        for (const Booking& b : bookings)
        {
            if (b.getBookingId() == bookingId)
            {
                printError("Booking ID already exists.");
                return 0;
            }

            if (b.getFlightNumber() == flightNumber &&
                b.getSeatNumber() == seatNumber &&
                b.getStatus() == "Confirmed")
            {
                printError("Seat is already booked.");
                return 0;
            }
        }

        Seat* seat = selected->findSeat(seatNumber);

        if (seat == nullptr)
        {
            printError("Seat does not exist.");
            return 0;
        }

        if (seat->isBooked())
        {
            printError("Seat is already booked.");
            return 0;
        }

        seat->bookSeat();

        Booking booking(
            bookingId,
            passengerId,
            flightNumber,
            seatNumber,
            seat->getPrice()
        );

        bookings.push_back(booking);
        fm.saveBookings(bookings);

        cout << "{\"success\":true,\"message\":\"Booking saved\","
             << "\"bookingId\":" << bookingId << ","
             << "\"flightNumber\":\"" << escapeJson(flightNumber) << "\","
             << "\"seatNumber\":\"" << escapeJson(seatNumber) << "\"}";

        return 0;
    }

    if (action == "cancel")
    {
        int bookingId = getIntArg(argc, argv, "--id");

        for (Booking& booking : bookings)
        {
            if (booking.getBookingId() == bookingId &&
                booking.getStatus() == "Confirmed")
            {
                booking.cancelBooking();
                fm.saveBookings(bookings);

                cout << "{\"success\":true,\"message\":\"Booking cancelled\"}";
                return 0;
            }
        }

        printError("Confirmed booking not found.");
        return 0;
    }

    if (action == "bookings")
    {
        cout << "{\"success\":true,\"bookings\":[";

        for (size_t i = 0; i < bookings.size(); i++)
        {
            const Booking& b = bookings[i];

            if (i) cout << ",";

            cout << "{\"bookingId\":" << b.getBookingId()
                 << ",\"passengerId\":" << b.getPassengerId()
                 << ",\"flightNumber\":\""
                 << escapeJson(b.getFlightNumber()) << "\""
                 << ",\"seatNumber\":\""
                 << escapeJson(b.getSeatNumber()) << "\""
                 << ",\"price\":" << b.getPrice()
                 << ",\"status\":\""
                 << escapeJson(b.getStatus()) << "\"}";
        }

        cout << "]}";
        return 0;
    }

    // Default action: return flights and their actual seat maps.
    cout << fixed << setprecision(2);
    cout << "{\"success\":true,\"flights\":[";

    for (size_t i = 0; i < flights.size(); i++)
    {
        const Flight& flight = flights[i];

        if (i) cout << ",";

        const vector<Seat>& seats = flight.getSeats();

        int booked = 0;

        for (const Seat& seat : seats)
            if (seat.isBooked()) booked++;

        cout << "{\"id\":" << i + 1
             << ",\"flightNumber\":\""
             << escapeJson(flight.getFlightNumber()) << "\""
             << ",\"source\":\""
             << escapeJson(flight.getSource()) << "\""
             << ",\"destination\":\""
             << escapeJson(flight.getDestination()) << "\""
             << ",\"date\":\""
             << escapeJson(flight.getDate()) << "\""
             << ",\"airline\":\"Flight Operator\""
             << ",\"departure\":\"09:00\""
             << ",\"arrival\":\"12:00\""
             << ",\"duration\":\"3h 00m\""
             << ",\"price\":5000"
             << ",\"seats\":" << seats.size()
             << ",\"totalSeats\":" << seats.size()
             << ",\"bookedSeats\":" << booked
             << ",\"seatMap\":[";

        for (size_t j = 0; j < seats.size(); j++)
        {
            const Seat& seat = seats[j];

            if (j) cout << ",";

            cout << "{\"seatNumber\":\""
                 << escapeJson(seat.getSeatNumber()) << "\""
                 << ",\"seatClass\":\""
                 << escapeJson(seat.getSeatClass()) << "\""
                 << ",\"price\":" << seat.getPrice()
                 << ",\"booked\":"
                 << (seat.isBooked() ? "true" : "false")
                 << "}";
        }

        cout << "]}";
    }

    cout << "]}";

    return 0;
}
