#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <iostream>
#include <fstream>
#include <string>
#include <vector>

#include "Flight.h"
#include "Booking.h"
#include "Passenger.h"

using namespace std;

class FileManager
{
public:
    void saveFlights(const vector<Flight>& flights);
    void saveBookings(const vector<Booking>& bookings);
    void savePassengers(const vector<Passenger>& passengers);

    vector<Flight> loadFlights();
    vector<Booking> loadBookings();
    vector<Passenger> loadPassengers();
};

#endif