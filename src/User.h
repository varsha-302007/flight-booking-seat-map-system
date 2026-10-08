#ifndef USER_H
#define USER_H

#include <string>

using namespace std;

class User
{
protected:
    int userId;
    string name;
    string phone;
    string email;

public:
    User(int id, string name, string phone, string email);

    int getUserId() const;
    string getName() const;
    string getPhone() const;
    string getEmail() const;

    virtual void displayRole() const;
    virtual void displayUser() const;

    virtual ~User() {}
};

#endif