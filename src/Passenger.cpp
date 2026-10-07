#include "Passenger.h"
#include <iostream>

using namespace std;

Passenger::Passenger(int id, string name, string phone, string email)
{
    passengerId = id;
    this->name = name;
    this->phone = phone;
    this->email = email;
}

int Passenger::getPassengerId() const
{
    return passengerId;
}

string Passenger::getName() const
{
    return name;
}

string Passenger::getPhone() const
{
    return phone;
}

string Passenger::getEmail() const
{
    return email;
}

void Passenger::displayPassenger() const
{
    cout << "\nPassenger ID: " << passengerId << endl;
    cout << "Name: " << name << endl;
    cout << "Phone: " << phone << endl;
    cout << "Email: " << email << endl;
}