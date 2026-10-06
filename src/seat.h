#ifndef SEAT_H
#define SEAT_H

#include <string>

using namespace std;

class Seat
{
private:
    string seatNumber;
    string seatClass;
    bool booked;
    double price;

public:
    Seat(string number, string seatClass, double price);

    string getSeatNumber() const;
    string getSeatClass() const;
    bool isBooked() const;
    double getPrice() const;

    void bookSeat();
    void cancelSeat();
};

#endif