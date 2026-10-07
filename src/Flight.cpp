#include "Flight.h"
#include <iostream>

using namespace std;

Flight::Flight(string flightNumber, string source,
               string destination, string date)
{
    this->flightNumber = flightNumber;
    this->source = source;
    this->destination = destination;
    this->date = date;
}

string Flight::getFlightNumber() const
{
    return flightNumber;
}

string Flight::getSource() const
{
    return source;
}

string Flight::getDestination() const
{
    return destination;
}

string Flight::getDate() const
{
    return date;
}

void Flight::addSeat(Seat seat)
{
    seats.push_back(seat);
}

Seat* Flight::findSeat(string seatNumber)
{
    for (Seat& seat : seats)
    {
        if (seat.getSeatNumber() == seatNumber)
        {
            return &seat;
        }
    }

    return nullptr;
}

void Flight::displaySeats() const
{
    cout << "\nSeat Map for Flight " << flightNumber << endl;
    cout << "-----------------------------" << endl;

    for (const Seat& seat : seats)
    {
        cout << seat.getSeatNumber()
             << " - "
             << seat.getSeatClass()
             << " - ";

        if (seat.isBooked())
        {
            cout << "Booked";
        }
        else
        {
            cout << "Available";
        }

        cout << " - Rs." << seat.getPrice() << endl;
    }
}