#include <iostream>
#include <vector>

#include "Flight.h"
#include "Passenger.h"
#include "Booking.h"
#include "BookingException.h"
#include "User.h"
#include "FileManager.h"

using namespace std;

int main()
{
    FileManager fileManager;

    // --------------------------------------------------
    // FLIGHT SETUP
    // --------------------------------------------------

    Flight flight1(
        "AI101",
        "Chennai",
        "Delhi",
        "10-10-2026"
    );

    flight1.addSeat(
        Seat("1A", "Economy", 5000)
    );

    flight1.addSeat(
        Seat("1B", "Economy", 5000)
    );

    flight1.addSeat(
        Seat("1C", "Economy", 5000)
    );

    flight1.addSeat(
        Seat("1D", "Business", 9000)
    );

    // --------------------------------------------------
    // PASSENGER SETUP
    // --------------------------------------------------

    vector<Passenger> passengers =
        fileManager.loadPassengers();

    if (passengers.empty())
    {
        passengers.push_back(
            Passenger(
                101,
                "Varsha",
                "9876543210",
                "varsha@gmail.com"
            )
        );
    }

    Passenger passenger1 = passengers[0];

    // --------------------------------------------------
    // LOAD PREVIOUS BOOKINGS
    // --------------------------------------------------

    vector<Booking> bookings =
        fileManager.loadBookings();

    int nextBookingId = 1001;

    for (const Booking& booking : bookings)
    {
        if (booking.getBookingId() >= nextBookingId)
        {
            nextBookingId =
                booking.getBookingId() + 1;
        }

        // Restore booked seats only for confirmed bookings
        if (booking.getStatus() == "Confirmed")
        {
            if (booking.getFlightNumber()
                == flight1.getFlightNumber())
            {
                Seat* seat =
                    flight1.findSeat(
                        booking.getSeatNumber()
                    );

                if (seat != nullptr &&
                    !seat->isBooked())
                {
                    seat->bookSeat();
                }
            }
        }
    }

    // --------------------------------------------------
    // SAVE INITIAL FLIGHT INFORMATION
    // --------------------------------------------------

    vector<Flight> flights;

    flights.push_back(flight1);

    fileManager.saveFlights(flights);

    int choice;

    do
    {
        cout << "\n";
        cout << "====================================\n";
        cout << "       FLIGHT BOOKING SYSTEM\n";
        cout << "====================================\n";

        cout << "1. View Flight Details\n";
        cout << "2. View Seat Map\n";
        cout << "3. Book a Seat\n";
        cout << "4. View All Bookings\n";
        cout << "5. Cancel Booking\n";
        cout << "6. View Passenger Details\n";
        cout << "7. Test Polymorphism\n";
        cout << "8. Exit\n";

        cout << "====================================\n";

        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice)
        {
        // --------------------------------------------------
        // VIEW FLIGHT
        // --------------------------------------------------

        case 1:

            cout << "\n===== FLIGHT DETAILS =====\n";

            cout << "Flight: "
                 << flight1.getFlightNumber()
                 << endl;

            cout << "Route: "
                 << flight1.getSource()
                 << " -> "
                 << flight1.getDestination()
                 << endl;

            cout << "Date: "
                 << flight1.getDate()
                 << endl;

            break;

        // --------------------------------------------------
        // VIEW SEAT MAP
        // --------------------------------------------------

        case 2:

            flight1.displaySeats();

            break;

        // --------------------------------------------------
        // BOOK SEAT
        // --------------------------------------------------

        case 3:
        {
            string selectedSeat;

            cout << "\nEnter seat number: ";
            cin >> selectedSeat;

            try
            {
                Seat* seat =
                    flight1.findSeat(selectedSeat);

                if (seat == nullptr)
                {
                    throw BookingException(
                        "Invalid seat number!"
                    );
                }

                if (seat->isBooked())
                {
                    throw BookingException(
                        "Seat " + selectedSeat +
                        " is already booked!"
                    );
                }

                double dynamicPrice =
                    flight1.calculateDynamicPrice(seat);

                cout << "\n===== PRICE DETAILS =====\n";

                cout << "Seat: "
                     << seat->getSeatNumber()
                     << endl;

                cout << "Class: "
                     << seat->getSeatClass()
                     << endl;

                cout << "Base Price: Rs."
                     << seat->getPrice()
                     << endl;

                cout << "Final Price: Rs."
                     << dynamicPrice
                     << endl;

                flight1.bookSeat(selectedSeat);

                Booking newBooking(
                    nextBookingId,
                    passenger1.getUserId(),
                    flight1.getFlightNumber(),
                    seat->getSeatNumber(),
                    dynamicPrice
                );

                bookings.push_back(newBooking);

                nextBookingId++;

                // Save immediately after successful booking
                fileManager.saveBookings(bookings);

                passengers.clear();
                passengers.push_back(passenger1);

                fileManager.savePassengers(passengers);

                cout << "\n===== BOOKING CONFIRMED =====\n";

                newBooking.displayBooking();
            }
            catch (const BookingException& e)
            {
                cout << "\nBooking failed: "
                     << e.what()
                     << endl;
            }

            break;
        }

        // --------------------------------------------------
        // VIEW BOOKINGS
        // --------------------------------------------------

        case 4:

            if (bookings.empty())
            {
                cout << "\nNo bookings found.\n";
            }
            else
            {
                cout << "\n===== ALL BOOKINGS =====\n";

                for (const Booking& booking : bookings)
                {
                    booking.displayBooking();

                    cout << "-----------------------------\n";
                }
            }

            break;

        // --------------------------------------------------
        // CANCEL BOOKING
        // --------------------------------------------------

        case 5:
        {
            if (bookings.empty())
            {
                cout << "\nNo bookings found.\n";
                break;
            }

            int bookingId;

            cout << "\nEnter booking ID to cancel: ";
            cin >> bookingId;

            bool found = false;

            for (Booking& booking : bookings)
            {
                if (booking.getBookingId() == bookingId)
                {
                    found = true;

                    if (booking.getStatus() == "Cancelled")
                    {
                        cout << "\nBooking is already cancelled.\n";
                        break;
                    }

                    booking.cancelBooking();

                    Seat* seat =
                        flight1.findSeat(
                            booking.getSeatNumber()
                        );

                    if (seat != nullptr)
                    {
                        seat->cancelSeat();
                    }

                    // Save updated booking status
                    fileManager.saveBookings(bookings);

                    cout << "\nBooking "
                         << bookingId
                         << " cancelled successfully.\n";

                    break;
                }
            }

            if (!found)
            {
                cout << "\nBooking ID not found.\n";
            }

            break;
        }

        // --------------------------------------------------
        // PASSENGER DETAILS
        // --------------------------------------------------

        case 6:

            passenger1.displayUser();

            break;

        // --------------------------------------------------
        // POLYMORPHISM
        // --------------------------------------------------

        case 7:
        {
            cout << "\n===== POLYMORPHISM TEST =====\n";

            User* user = &passenger1;

            user->displayRole();
            user->displayUser();

            break;
        }

        // --------------------------------------------------
        // EXIT
        // --------------------------------------------------

        case 8:

            // Save latest data before exiting
            fileManager.saveBookings(bookings);

            passengers.clear();
            passengers.push_back(passenger1);

            fileManager.savePassengers(passengers);

            flights.clear();
            flights.push_back(flight1);

            fileManager.saveFlights(flights);

            cout << "\nData saved successfully.\n";

            cout << "\nThank you for using "
                 << "Flight Booking System!\n";

            break;

        default:

            cout << "\nInvalid choice! "
                 << "Please try again.\n";
        }

    } while (choice != 8);

    return 0;
}