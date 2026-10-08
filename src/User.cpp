#include "User.h"
#include <iostream>

using namespace std;

User::User(int id, string name, string phone, string email)
{
    userId = id;
    this->name = name;
    this->phone = phone;
    this->email = email;
}

int User::getUserId() const
{
    return userId;
}

string User::getName() const
{
    return name;
}

string User::getPhone() const
{
    return phone;
}

string User::getEmail() const
{
    return email;
}

void User::displayRole() const
{
    cout << "Role: User" << endl;
}

void User::displayUser() const
{
    cout << "\nUser ID: " << userId << endl;
    cout << "Name: " << name << endl;
    cout << "Phone: " << phone << endl;
    cout << "Email: " << email << endl;
}