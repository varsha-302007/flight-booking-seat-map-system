#ifndef FLIGHTMANAGER_H
#define FLIGHTMANAGER_H
#include <iostream>
#include <vector>
#include <string>
#include "Flight.h"
using namespace std;
class FlightManager
{
private:
    vector<Flight> flights;

public:
    void addFlight(const Flight& flight);
    bool removeFlight(const string& flightNumber);
    Flight* findFlight(const string& flightNumber);
    void displayFlights() const;
};

#endif