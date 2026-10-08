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

double Flight::calculateDynamicPrice(Seat* seat) const
{
    int totalSeats = seats.size();
    int bookedSeats = 0;

    for (const Seat& currentSeat : seats)
    {
        if (currentSeat.isBooked())
        {
            bookedSeats++;
        }
    }

    if (totalSeats == 0)
    {
        return seat->getPrice();
    }

    double occupancy =
        (double)bookedSeats / totalSeats * 100;

    double basePrice = seat->getPrice();

    if (occupancy <= 25)
    {
        return basePrice;
    }
    else if (occupancy <= 50)
    {
        return basePrice * 1.10;
    }
    else if (occupancy <= 75)
    {
        return basePrice * 1.20;
    }
    else
    {
        return basePrice * 1.30;
    }
}

void Flight::displaySeats() const
{
    cout << "\nSeat Map for Flight "
         << flightNumber << endl;

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

        cout << " - Base Price: Rs."
             << seat.getPrice();

        cout << endl;
    }
}