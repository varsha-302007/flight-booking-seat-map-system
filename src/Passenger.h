#ifndef PASSENGER_H
#define PASSENGER_H

#include <string>

using namespace std;

class Passenger
{
private:
    int passengerId;
    string name;
    string phone;
    string email;

public:
    Passenger(int id, string name, string phone, string email);

    int getPassengerId() const;
    string getName() const;
    string getPhone() const;
    string getEmail() const;

    void displayPassenger() const;
};

#endif