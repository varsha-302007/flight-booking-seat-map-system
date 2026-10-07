#include "Seat.h"

using namespace std;

Seat::Seat(string number, string seatClass, double price)
{
    this->seatNumber = number;
    this->seatClass = seatClass;
    this->price = price;
    this->booked = false;
}

string Seat::getSeatNumber() const
{
    return seatNumber;
}

string Seat::getSeatClass() const
{
    return seatClass;
}

bool Seat::isBooked() const
{
    return booked;
}

double Seat::getPrice() const
{
    return price;
}

void Seat::bookSeat()
{
    booked = true;
}

void Seat::cancelSeat()
{
    booked = false;
}