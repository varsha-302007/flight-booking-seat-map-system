#ifndef PASSENGER_H
#define PASSENGER_H

#include "User.h"

using namespace std;

class Passenger : public User
{
public:
    Passenger(int id, string name, string phone, string email);

    void displayRole() const override;
    void displayUser() const override;
};

#endif