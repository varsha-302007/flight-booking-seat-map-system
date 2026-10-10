# Project Approach and Workflow

## Development Approach

The project is developed using a modular approach, separating
the frontend, backend, and API communication.

## System Workflow

1. The user opens the SkyBook application.
2. The user enters the source, destination, and travel date.
3. The frontend sends requests to the Node.js API bridge.
4. The Node.js server executes the C++ backend.
5. The C++ backend processes flight information.
6. The results are returned to the frontend and displayed.
7. The user selects a flight and seat.
8. The system processes the booking and displays confirmation.
9. Users can view or cancel bookings through the interface.

## Development Plan

- Phase 1: Develop the C++ backend using OOP concepts.
- Phase 2: Implement flight, seat, passenger, and booking classes.
- Phase 3: Develop the React frontend.
- Phase 4: Create the Node.js API bridge.
- Phase 5: Connect the frontend with the C++ backend.
- Phase 6: Test the application and fix errors.
- Phase 7: Prepare project documentation.

## Architecture

React Frontend
       ↓
Node.js API Bridge
       ↓
C++ Backend
       ↓
File Storage