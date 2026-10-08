#include <iostream>

#include "Flight.h"
#include "Passenger.h"
#include "Booking.h"
#include "BookingException.h"

using namespace std;

int main()
{
    // ==========================================
    // CREATE FLIGHT
    // ==========================================

    Flight flight1(
        "AI101",
        "Chennai",
        "Delhi",
        "10-10-2026"
    );

    // ==========================================
    // ADD SEATS
    // ==========================================

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

    // ==========================================
    // CREATE PASSENGER
    // ==========================================

    Passenger passenger1(
        101,
        "Varsha",
        "9876543210",
        "varsha@gmail.com"
    );

    Booking* booking = nullptr;

    int nextBookingId = 1001;

    int choice;

    // ==========================================
    // MAIN MENU
    // ==========================================

    do
    {
        cout << "\n";
        cout << "====================================\n";
        cout << "       FLIGHT BOOKING SYSTEM\n";
        cout << "====================================\n";

        cout << "1. View Flight Details\n";
        cout << "2. View Seat Map\n";
        cout << "3. Book a Seat\n";
        cout << "4. View Booking\n";
        cout << "5. Cancel Booking\n";
        cout << "6. Exit\n";

        cout << "====================================\n";

        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice)
        {
        // ======================================
        // VIEW FLIGHT
        // ======================================

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

        // ======================================
        // VIEW SEAT MAP
        // ======================================

        case 2:

            flight1.displaySeats();

            break;

        // ======================================
        // BOOK SEAT
        // ======================================

        case 3:
        {
            string selectedSeat;

            cout << "\nEnter seat number: ";
            cin >> selectedSeat;

            try
            {
                // Find seat
                Seat* seat =
                    flight1.findSeat(selectedSeat);

                // Calculate price before booking
                if (seat == nullptr)
                {
                    throw BookingException(
                        "Invalid seat number!"
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

                // Book seat
                flight1.bookSeat(selectedSeat);

                // Remove previous booking
                if (booking != nullptr)
                {
                    delete booking;
                    booking = nullptr;
                }

                // Create booking
                booking = new Booking(
                    nextBookingId,
                    passenger1.getPassengerId(),
                    flight1.getFlightNumber(),
                    seat->getSeatNumber(),
                    dynamicPrice
                );

                nextBookingId++;

                cout << "\n===== BOOKING CONFIRMED =====\n";

                booking->displayBooking();
            }
            catch (const BookingException& e)
            {
                cout << "\nBooking failed: "
                     << e.what()
                     << endl;
            }

            break;
        }

        // ======================================
        // VIEW BOOKING
        // ======================================

        case 4:

            if (booking == nullptr)
            {
                cout << "\nNo booking found.\n";
            }
            else
            {
                booking->displayBooking();
            }

            break;

        // ======================================
        // CANCEL BOOKING
        // ======================================

        case 5:

            if (booking == nullptr)
            {
                cout << "\nNo booking found.\n";
            }
            else
            {
                booking->cancelBooking();

                Seat* seat =
                    flight1.findSeat(
                        booking->getSeatNumber()
                    );

                if (seat != nullptr)
                {
                    seat->cancelSeat();
                }

                cout << "\nBooking cancelled successfully.\n";
            }

            break;

        // ======================================
        // EXIT
        // ======================================

        case 6:

            cout << "\nThank you for using "
                 << "Flight Booking System!\n";

            break;

        // ======================================
        // INVALID MENU OPTION
        // ======================================

        default:

            cout << "\nInvalid choice! "
                 << "Please try again.\n";
        }

    } while (choice != 6);

    delete booking;

    return 0;
}