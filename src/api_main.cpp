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
#include "Seat.h"

using namespace std;

string escapeJson(const string& value)
{
    string result;

    for (char c : value)
    {
        switch (c)
        {
            case '"':  result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\n': result += "\\n"; break;
            case '\r': result += "\\r"; break;
            case '\t': result += "\\t"; break;
            default:   result += c;
        }
    }

    return result;
}

string getArg(int argc, char* argv[], const string& key)
{
    for (int i = 1; i + 1 < argc; i++)
    {
        if (string(argv[i]) == key)
            return argv[i + 1];
    }

    return "";
}

int getIntArg(int argc, char* argv[], const string& key)
{
    string value = getArg(argc, argv, key);

    try
    {
        return stoi(value);
    }
    catch (...)
    {
        return 0;
    }
}

void printError(const string& message)
{
    cout << "{\"success\":false,\"message\":\""
         << escapeJson(message) << "\"}";
}

void addDefaultSeats(Flight& flight)
{
    // Create the default seat map only when the flight has no seats.
    if (!flight.getSeats().empty())
        return;

    for (int row = 1; row <= 6; row++)
    {
        for (char col = 'A'; col <= 'D'; col++)
        {
            flight.addSeat(
                Seat(to_string(row) + col, "Economy", 5000)
            );
        }
    }

    for (int row = 7; row <= 8; row++)
    {
        for (char col = 'A'; col <= 'D'; col++)
        {
            flight.addSeat(
                Seat(to_string(row) + col, "Business", 9000)
            );
        }
    }
}

int main(int argc, char* argv[])
{
    FileManager fm;

    vector<Flight> flights = fm.loadFlights();
    vector<Booking> bookings = fm.loadBookings();

    // Create a sample flight if no flight data exists.
    if (flights.empty())
    {
        flights.emplace_back(
            "AI101", "Chennai", "Delhi", "10-10-2026"
        );
    }

    // Ensure every loaded flight has seats.
    for (Flight& flight : flights)
    {
        addDefaultSeats(flight);
    }

    // Restore confirmed bookings to the seat maps.
    for (Flight& flight : flights)
    {
        for (const Booking& booking : bookings)
        {
            if (booking.getStatus() != "Confirmed" ||
                booking.getFlightNumber() != flight.getFlightNumber())
            {
                continue;
            }

            Seat* seat = flight.findSeat(booking.getSeatNumber());

            if (seat != nullptr && !seat->isBooked())
            {
                seat->bookSeat();
            }
        }
    }

    string action = getArg(argc, argv, "--action");

    // BOOK A SEAT
    if (action == "book")
    {
        string flightNumber = getArg(argc, argv, "--flight");
        string seatNumber = getArg(argc, argv, "--seat");
        int passengerId = getIntArg(argc, argv, "--passenger");
        int bookingId = getIntArg(argc, argv, "--id");

        Flight* selected = nullptr;

        for (Flight& flight : flights)
        {
            if (flight.getFlightNumber() == flightNumber)
            {
                selected = &flight;
                break;
            }
        }

        if (selected == nullptr ||
            seatNumber.empty() ||
            passengerId <= 0 ||
            bookingId <= 0)
        {
            printError("Invalid flight, seat, passenger, or booking ID.");
            return 0;
        }

        for (const Booking& booking : bookings)
        {
            if (booking.getBookingId() == bookingId)
            {
                printError("Booking ID already exists.");
                return 0;
            }

            if (booking.getFlightNumber() == flightNumber &&
                booking.getSeatNumber() == seatNumber &&
                booking.getStatus() == "Confirmed")
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

        cout << "{\"success\":true,"
             << "\"message\":\"Booking saved\","
             << "\"bookingId\":" << bookingId << ","
             << "\"flightNumber\":\""
             << escapeJson(flightNumber) << "\","
             << "\"seatNumber\":\""
             << escapeJson(seatNumber) << "\"}";

        return 0;
    }

    // CANCEL A BOOKING
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

                cout << "{\"success\":true,"
                     << "\"message\":\"Booking cancelled\"}";

                return 0;
            }
        }

        printError("Confirmed booking not found.");
        return 0;
    }

    // GET ALL BOOKINGS
    if (action == "bookings")
    {
        cout << "{\"success\":true,\"bookings\":[";

        for (size_t i = 0; i < bookings.size(); i++)
        {
            const Booking& booking = bookings[i];

            if (i > 0)
                cout << ",";

            cout << "{\"bookingId\":" << booking.getBookingId()
                 << ",\"passengerId\":" << booking.getPassengerId()
                 << ",\"flightNumber\":\""
                 << escapeJson(booking.getFlightNumber()) << "\""
                 << ",\"seatNumber\":\""
                 << escapeJson(booking.getSeatNumber()) << "\""
                 << ",\"price\":" << booking.getPrice()
                 << ",\"status\":\""
                 << escapeJson(booking.getStatus()) << "\"}";
        }

        cout << "]}";

        return 0;
    }

    // GET FLIGHTS AND SEAT MAPS
    cout << fixed << setprecision(2);
    cout << "{\"success\":true,\"flights\":[";

    for (size_t i = 0; i < flights.size(); i++)
    {
        const Flight& flight = flights[i];

        if (i > 0)
            cout << ",";

        const vector<Seat>& seats = flight.getSeats();

        int booked = 0;

        for (const Seat& seat : seats)
        {
            if (seat.isBooked())
                booked++;
        }

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

            if (j > 0)
                cout << ",";

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
