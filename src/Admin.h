#ifndef ADMIN_H
#define ADMIN_H

#include <iostream>
#include <string>
#include "FlightManager.h"

using namespace std;

class Admin
{
private:
    string adminId;
    string username;
    string password;

    FlightManager& flightManager;

public:
    Admin(string id, string user, string pass, FlightManager& manager);

    void displayAdminMenu();
    void addFlight();
    void removeFlight();
    void viewFlights();
};

#endif