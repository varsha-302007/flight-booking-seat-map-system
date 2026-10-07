#ifndef FLIGHT_H
#define FLIGHT_H

#include <string>
#include <vector>
#include "Seat.h"

using namespace std;

class Flight
{
private:
    string flightNumber;
    string source;
    string destination;
    string date;
    vector<Seat> seats;

public:
    Flight(string flightNumber, string source, string destination, string date);

    string getFlightNumber() const;
    string getSource() const;
    string getDestination() const;
    string getDate() const;

    void addSeat(Seat seat);
    Seat* findSeat(string seatNumber);
    void displaySeats() const;
};

#endif