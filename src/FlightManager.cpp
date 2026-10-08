#include "FlightManager.h"
void FlightManager::addFlight(const Flight& flight)
{
    if (findFlight(flight.getFlightNumber()) != nullptr)
    {
        cout << "Flight already exists." << endl;
        return;
    }

    flights.push_back(flight);

    cout << "Flight added successfully." << endl;
}
bool FlightManager::removeFlight(const string& flightNumber)
{
    for (auto it = flights.begin(); it != flights.end(); ++it)
    {
        if (it->getFlightNumber() == flightNumber)
        {
            flights.erase(it);

            cout << "Flight removed successfully." << endl;
            return true;
        }
    }

    cout << "Flight not found." << endl;
    return false;
}
Flight* FlightManager::findFlight(const string& flightNumber)
{
    for (auto& flight : flights)
    {
        if (flight.getFlightNumber() == flightNumber)
        {
            return &flight;
        }
    }

    return nullptr;
}
void FlightManager::displayFlights() const
{
    if (flights.empty())
    {
        cout << "No flights available." << endl;
        return;
    }

    cout << "\n----- Available Flights -----" << endl;

    for (const auto& flight : flights)
    {
        cout << "Flight Number : "
             << flight.getFlightNumber() << endl;

        cout << "Source        : "
             << flight.getSource() << endl;

        cout << "Destination   : "
             << flight.getDestination() << endl;

        cout << "Date          : "
             << flight.getDate() << endl;

        cout << "-----------------------------" << endl;
    }
}