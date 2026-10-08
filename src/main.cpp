#include <iostream>

#include "Flight.h"
#include "Passenger.h"
#include "Booking.h"

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

    // Pointer to current booking
    Booking* booking = nullptr;

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

        // ======================================
        // OPTION 1
        // ======================================

        switch (choice)
        {
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
        // OPTION 2
        // ======================================

        case 2:

            flight1.displaySeats();

            break;

        // ======================================
        // OPTION 3
        // BOOK SEAT
        // ======================================

        case 3:
        {
            string selectedSeat;

            cout << "\nEnter seat number: ";
            cin >> selectedSeat;

            Seat* seat =
                flight1.findSeat(selectedSeat);

            // Check whether seat exists
            if (seat == nullptr)
            {
                cout << "\nInvalid seat number!\n";
                break;
            }

            // Check whether seat is already booked
            if (seat->isBooked())
            {
                cout << "\nSorry! Seat is already booked.\n";
                break;
            }

            // Calculate dynamic price BEFORE booking
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

            // Book the seat
            seat->bookSeat();

            // Delete previous booking if one exists
            if (booking != nullptr)
            {
                delete booking;
                booking = nullptr;
            }

            // Create new booking
            booking = new Booking(
                1001,
                passenger1.getPassengerId(),
                flight1.getFlightNumber(),
                seat->getSeatNumber(),
                dynamicPrice
            );

            cout << "\n===== BOOKING CONFIRMED =====\n";

            booking->displayBooking();

            break;
        }

        // ======================================
        // OPTION 4
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
        // OPTION 5
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
        // OPTION 6
        // EXIT
        // ======================================

        case 6:

            cout << "\nThank you for using "
                 << "Flight Booking System!\n";

            break;

        // ======================================
        // INVALID OPTION
        // ======================================

        default:

            cout << "\nInvalid choice! "
                 << "Please try again.\n";
        }

    } while (choice != 6);

    // Free dynamically allocated booking
    delete booking;

    return 0;
}