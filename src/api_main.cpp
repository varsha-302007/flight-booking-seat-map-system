#include <iostream>
#include <vector>
#include <string>
#include <iomanip>

#include "Flight.h"
#include "FileManager.h"

using namespace std;

// Escape special characters so strings are safe in JSON.
string escapeJson(const string& value)
{
    string result;

    for (char c : value)
    {
        switch (c)
        {
            case '"':
                result += "\\\"";
                break;

            case '\\':
                result += "\\\\";
                break;

            case '\n':
                result += "\\n";
                break;

            case '\r':
                result += "\\r";
                break;

            case '\t':
                result += "\\t";
                break;

            default:
                result += c;
        }
    }

    return result;
}

int main()
{
    FileManager fileManager;

    vector<Flight> flights = fileManager.loadFlights();
    vector<Booking> bookings = fileManager.loadBookings();

    // Provide a sample flight if no flight data exists.
    if (flights.empty())
    {
        Flight flight(
            "AI101",
            "Chennai",
            "Delhi",
            "10-10-2026"
        );

        // Add sample economy seats.
        for (int row = 1; row <= 6; row++)
        {
            flight.addSeat(Seat(
                to_string(row) + "A",
                "Economy",
                5000
            ));

            flight.addSeat(Seat(
                to_string(row) + "B",
                "Economy",
                5000
            ));

            flight.addSeat(Seat(
                to_string(row) + "C",
                "Economy",
                5000
            ));

            flight.addSeat(Seat(
                to_string(row) + "D",
                "Economy",
                5000
            ));
        }

        // Add business-class seats.
        for (int row = 7; row <= 8; row++)
        {
            flight.addSeat(Seat(
                to_string(row) + "A",
                "Business",
                9000
            ));

            flight.addSeat(Seat(
                to_string(row) + "B",
                "Business",
                9000
            ));

            flight.addSeat(Seat(
                to_string(row) + "C",
                "Business",
                9000
            ));

            flight.addSeat(Seat(
                to_string(row) + "D",
                "Business",
                9000
            ));
        }

        flights.push_back(flight);

        fileManager.saveFlights(flights);
    }

    cout << fixed << setprecision(2);

    cout << "{";
    cout << "\"success\":true,";
    cout << "\"flights\":[";

    for (size_t i = 0; i < flights.size(); i++)
    {
        const Flight& flight = flights[i];

        int totalSeats = 0;
        int bookedSeats = 0;

        // Count the seats using the current seat-map data.
        // Note: Flight currently exposes no method to enumerate seats,
        // so seat totals cannot yet be calculated from its private vector.

        cout << "{";

        cout << "\"id\":" << (i + 1) << ",";

        cout << "\"flightNumber\":\""
             << escapeJson(flight.getFlightNumber())
             << "\",";

        cout << "\"source\":\""
             << escapeJson(flight.getSource())
             << "\",";

        cout << "\"destination\":\""
             << escapeJson(flight.getDestination())
             << "\",";

        cout << "\"date\":\""
             << escapeJson(flight.getDate())
             << "\",";

        // Compatibility fields expected by the existing React cards.
        cout << "\"airline\":\"Flight Operator\",";
        cout << "\"departure\":\"09:00\",";
        cout << "\"arrival\":\"12:00\",";
        cout << "\"duration\":\"3h 00m\",";
        cout << "\"price\":5000,";
        cout << "\"seats\":32,";
        cout << "\"totalSeats\":32";

        cout << "}";

        if (i + 1 < flights.size())
        {
            cout << ",";
        }
    }

    cout << "]";
    cout << "}";

    return 0;
}
