#include "Booking.h"
#include <iostream>

using namespace std;

Booking::Booking(int bookingId, int passengerId,
                 string flightNumber, string seatNumber,
                 double price)
{
    this->bookingId = bookingId;
    this->passengerId = passengerId;
    this->flightNumber = flightNumber;
    this->seatNumber = seatNumber;
    this->price = price;
    this->status = "Confirmed";
}

int Booking::getBookingId() const
{
    return bookingId;
}

string Booking::getFlightNumber() const
{
    return flightNumber;
}

string Booking::getSeatNumber() const
{
    return seatNumber;
}

double Booking::getPrice() const
{
    return price;
}

string Booking::getStatus() const
{
    return status;
}

void Booking::cancelBooking()
{
    status = "Cancelled";
}

void Booking::displayBooking() const
{
    cout << "\nBooking ID: " << bookingId << endl;
    cout << "Passenger ID: " << passengerId << endl;
    cout << "Flight: " << flightNumber << endl;
    cout << "Seat: " << seatNumber << endl;
    cout << "Price: Rs." << price << endl;
    cout << "Status: " << status << endl;
}