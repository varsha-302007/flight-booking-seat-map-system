#ifndef BOOKING_H
#define BOOKING_H

#include <string>

using namespace std;

class Booking
{
private:
    int bookingId;
    int passengerId;
    string flightNumber;
    string seatNumber;
    double price;
    string status;

public:
    Booking(int bookingId, int passengerId, string flightNumber,
            string seatNumber, double price);

    int getBookingId() const;
    string getFlightNumber() const;
    string getSeatNumber() const;
    double getPrice() const;
    string getStatus() const;

    void cancelBooking();
    void displayBooking() const;
};

#endif