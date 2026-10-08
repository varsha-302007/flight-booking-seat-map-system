#include "FileManager.h"
#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

void FileManager::saveFlights(const vector<Flight>& flights)
{
    ofstream file("data/flights.txt");

    if (!file)
    {
        cout << "Unable to open flights file." << endl;
        return;
    }

    for (const Flight& flight : flights)
    {
        file << flight.getFlightNumber() << "|"
             << flight.getSource() << "|"
             << flight.getDestination() << "|"
             << flight.getDate() << endl;
    }

    file.close();
}

vector<Flight> FileManager::loadFlights()
{
    vector<Flight> flights;

    ifstream file("data/flights.txt");

    if (!file)
    {
        return flights;
    }

    string line;

    while (getline(file, line))
    {
        stringstream ss(line);

        string flightNumber;
        string source;
        string destination;
        string date;

        getline(ss, flightNumber, '|');
        getline(ss, source, '|');
        getline(ss, destination, '|');
        getline(ss, date, '|');

        Flight flight(flightNumber, source, destination, date);
        flights.push_back(flight);
    }

    file.close();

    return flights;
}

void FileManager::saveBookings(const vector<Booking>& bookings)
{
    ofstream file("data/bookings.txt");

    if (!file)
    {
        cout << "Unable to open bookings file." << endl;
        return;
    }

    for (const Booking& booking : bookings)
    {
        file << booking.getBookingId() << "|"
             << booking.getFlightNumber() << "|"
             << booking.getSeatNumber() << "|"
             << booking.getPrice() << "|"
             << booking.getStatus() << endl;
    }

    file.close();
}

vector<Booking> FileManager::loadBookings()
{
    vector<Booking> bookings;

    ifstream file("data/bookings.txt");

    if (!file)
    {
        return bookings;
    }

    string line;

    while (getline(file, line))
    {
        stringstream ss(line);

        int bookingId;
        int passengerId;
        string flightNumber;
        string seatNumber;
        double price;
        string status;

        string temp;

        getline(ss, temp, '|');
        bookingId = stoi(temp);

        getline(ss, temp, '|');
        passengerId = stoi(temp);

        getline(ss, flightNumber, '|');
        getline(ss, seatNumber, '|');

        getline(ss, temp, '|');
        price = stod(temp);

        getline(ss, status, '|');

        Booking booking(bookingId, passengerId, flightNumber, seatNumber, price);
        bookings.push_back(booking);
    }

    file.close();

    return bookings;
}

void FileManager::savePassengers(const vector<Passenger>& passengers)
{
    ofstream file("data/passengers.txt");

    if (!file)
    {
        cout << "Unable to open passengers file." << endl;
        return;
    }

    for (const Passenger& passenger : passengers)
    {
        file << passenger.getPassengerId() << "|"
             << passenger.getName() << "|"
             << passenger.getPhone() << "|"
             << passenger.getEmail() << endl;
    }

    file.close();
}

vector<Passenger> FileManager::loadPassengers()
{
    vector<Passenger> passengers;

    ifstream file("data/passengers.txt");

    if (!file)
    {
        return passengers;
    }

    string line;

    while (getline(file, line))
    {
        stringstream ss(line);

        int passengerId;
        string name;
        string phone;
        string email;

        string temp;

        getline(ss, temp, '|');
        passengerId = stoi(temp);

        getline(ss, name, '|');
        getline(ss, phone, '|');
        getline(ss, email, '|');

        Passenger passenger(passengerId, name, phone, email);
        passengers.push_back(passenger);
    }

    file.close();

    return passengers;
}