#include <iostream>
#include "Flight.h"
#include "Passenger.h"
#include "Booking.h"

using namespace std;

int main()
{
    // Create flight
    Flight flight1(
        "AI101",
        "Chennai",
        "Delhi",
        "10-10-2026"
    );

    // Add seats
    flight1.addSeat(Seat("1A", "Economy", 5000));
    flight1.addSeat(Seat("1B", "Economy", 5000));
    flight1.addSeat(Seat("1C", "Economy", 5000));
    flight1.addSeat(Seat("1D", "Business", 9000));

    // Create passenger
    Passenger passenger1(
        101,
        "Varsha",
        "9876543210",
        "varsha@gmail.com"
    );

    string selectedSeat;
    Booking* booking = nullptr;

    int choice;

    do
    {
        cout << "\n====================================\n";
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
        case 1:
            cout << "\n===== FLIGHT DETAILS =====\n";

            cout << "Flight: "
                 << flight1.getFlightNumber() << endl;

            cout << "Route: "
                 << flight1.getSource()
                 << " -> "
                 << flight1.getDestination() << endl;

            cout << "Date: "
                 << flight1.getDate() << endl;

            break;

        case 2:
            flight1.displaySeats();
            break;

        case 3:
        {
            cout << "\nEnter seat number: ";
            cin >> selectedSeat;

            Seat* seat = flight1.findSeat(selectedSeat);

            if (seat == nullptr)
            {
                cout << "Invalid seat number!\n";
                break;
            }

            if (seat->isBooked())
            {
                cout << "Sorry! Seat is already booked.\n";
                break;
            }

            seat->bookSeat();

            booking = new Booking(
                1001,
                passenger1.getPassengerId(),
                flight1.getFlightNumber(),
                seat->getSeatNumber(),
                seat->getPrice()
            );

            cout << "\n===== BOOKING CONFIRMED =====\n";
            booking->displayBooking();

            break;
        }

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

        case 5:
            if (booking == nullptr)
            {
                cout << "\nNo booking found.\n";
            }
            else
            {
                booking->cancelBooking();

                Seat* seat = flight1.findSeat(
                    booking->getSeatNumber()
                );

                if (seat != nullptr)
                {
                    seat->cancelSeat();
                }

                cout << "\nBooking cancelled successfully.\n";
            }

            break;

        case 6:
            cout << "\nThank you for using Flight Booking System!\n";
            break;

        default:
            cout << "\nInvalid choice! Please try again.\n";
        }

    } while (choice != 6);

    delete booking;

    return 0;
}