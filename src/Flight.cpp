#include "Flight.h"
#include "BookingException.h"

#include <iostream>
#include <iomanip>

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

// ==========================================
// BOOK SEAT WITH EXCEPTION HANDLING
// ==========================================

void Flight::bookSeat(string seatNumber)
{
    Seat* seat = findSeat(seatNumber);

    if (seat == nullptr)
    {
        throw BookingException(
            "Invalid seat number!"
        );
    }

    if (seat->isBooked())
    {
        throw BookingException(
            "Seat " + seatNumber + " is already booked!"
        );
    }

    seat->bookSeat();
}

// ==========================================
// DYNAMIC PRICING
// ==========================================

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

// ==========================================
// VISUAL SEAT MAP
// ==========================================

void Flight::displaySeats() const
{
    cout << "\n";
    cout << "====================================\n";
    cout << "          SEAT MAP - "
         << flightNumber << "\n";
    cout << "====================================\n";

    cout << "\n";
    cout << "       A          B       C          D\n";
    cout << "     ----------------------------------\n";

    for (int i = 0; i < (int)seats.size(); i++)
    {
        const Seat& seat = seats[i];

        if (i % 4 == 0)
        {
            cout << "Row " << (i / 4 + 1) << " ";
        }

        if (seat.isBooked())
        {
            cout << "[ X ]      ";
        }
        else
        {
            cout << "[ " << seat.getSeatNumber() << " ]   ";
        }

        if (i % 4 == 3)
        {
            cout << endl;
        }
    }

    cout << "\nLegend:\n";
    cout << "[ 1A ] = Available\n";
    cout << "[ X ]  = Booked\n";

    cout << "\nDetailed Seat Information:\n";
    cout << "---------------------------------------------\n";

    for (const Seat& seat : seats)
    {
        cout << left
             << setw(5) << seat.getSeatNumber()
             << setw(12) << seat.getSeatClass()
             << "Rs." << setw(8) << seat.getPrice();

        if (seat.isBooked())
        {
            cout << "Booked";
        }
        else
        {
            cout << "Available";
        }

        cout << endl;
    }
}