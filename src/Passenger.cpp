#include "Passenger.h"
#include <iostream>

using namespace std;

Passenger::Passenger(int id, string name, string phone, string email)
    : User(id, name, phone, email)
{
}

void Passenger::displayRole() const
{
    cout << "Role: Passenger" << endl;
}

void Passenger::displayUser() const
{
    cout << "\n===== PASSENGER DETAILS =====\n";

    cout << "Passenger ID: " << userId << endl;
    cout << "Name: " << name << endl;
    cout << "Phone: " << phone << endl;
    cout << "Email: " << email << endl;
}