#include "Admin.h"
#include <iostream>

using namespace std;

Admin::Admin(string id, string user, string pass, FlightManager& manager)
    : adminId(id), username(user), password(pass), flightManager(manager)
{
}

void Admin::addFlight()
{
    string flightNumber;
    string source;
    string destination;
    string date;

    cout << "\nEnter flight number: ";
    cin >> flightNumber;

    cout << "Enter source: ";
    cin >> source;

    cout << "Enter destination: ";
    cin >> destination;

    cout << "Enter date: ";
    cin >> date;

    Flight flight(flightNumber, source, destination, date);

    flightManager.addFlight(flight);

    cout << "Flight added successfully." << endl;
}

void Admin::removeFlight()
{
    string flightNumber;

    cout << "\nEnter flight number to remove: ";
    cin >> flightNumber;

    if (flightManager.removeFlight(flightNumber))
    {
        cout << "Flight removed successfully." << endl;
    }
    else
    {
        cout << "Flight not found." << endl;
    }
}

void Admin::viewFlights()
{
    cout << "\n===== AVAILABLE FLIGHTS =====" << endl;
    flightManager.displayFlights();
}

void Admin::displayAdminMenu()
{
    int choice;

    do
    {
        cout << "\n===== ADMIN MENU =====" << endl;
        cout << "1. Add Flight" << endl;
        cout << "2. Remove Flight" << endl;
        cout << "3. View Flights" << endl;
        cout << "4. Exit" << endl;
        cout << "Enter your choice: ";

        cin >> choice;

        switch (choice)
        {
        case 1:
            addFlight();
            break;

        case 2:
            removeFlight();
            break;

        case 3:
            viewFlights();
            break;

        case 4:
            cout << "Exiting Admin Menu..." << endl;
            break;

        default:
            cout << "Invalid choice." << endl;
        }

    } while (choice != 4);
}