# Frontend Documentation and Testing

This document provides comprehensive information about the frontend application, including setup, build process, running the application, testing, and component documentation.

## Project Overview

This is a React-based frontend application for a movie review platform. It allows users to browse movies, read and post comments, rate movies, and view statistics. The application is built with modern web technologies and follows best practices for React development.

## Technologies Used

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript
- **Vite**: A modern frontend build tool that provides a faster and leaner development experience
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces
- **React Router**: A collection of navigational components for React applications
- **Vitest**: A Vite-native testing framework
- **React Testing Library**: A testing utility for React that encourages good testing practices

## Setup and Installation

To set up the project locally, follow these steps:

1. Ensure you have Node.js (v16 or later) and npm installed on your machine
2. Clone the repository
3. Navigate to the frontend directory
4. Install dependencies:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

## Build Process

The project uses Vite for building the application. The build process includes:

1. TypeScript compilation
2. Bundling with Vite
3. Minification and optimization for production

To build the project for production, run:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

This will start the development server at `http://localhost:5173` (or another port if 5173 is in use).

### Production Preview

To preview the production build locally:

```bash
npm run build
npm run preview
```

This will serve the production build at `http://localhost:4173` (or another port if 4173 is in use).

## Running Tests

To run the tests, you need to have Node.js and npm installed. Then, you can use the following commands:

```bash
# Run tests once
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test coverage report will be generated in the `coverage` directory.

## Project Structure

The project is organized as follows:

- `public/`: Static assets that are copied to the build directory
- `src/`: Source code
  - `components/`: React components organized by feature
    - `auth/`: Authentication-related components (login, register)
    - `comments/`: Comment-related components
    - `layout/`: Layout components (header, footer, etc.)
    - `movies/`: Movie-related components
  - `models/`: TypeScript interfaces and types
  - `services/`: Service classes for API communication
    - `ApiService.ts`: Base service for API requests
    - `UserService.ts`: User authentication and management
    - `CommentService.ts`: Comment creation and management
    - `MovieService.ts`: Movie data retrieval
    - `RatingService.ts`: Movie rating functionality
    - `StatisticsService.ts`: Statistics data retrieval
  - `test/`: Test setup and utilities
  - `utils/`: Utility functions
  - `App.tsx`: Main application component
  - `main.tsx`: Entry point of the application

## Components Documentation

### CommentItem

The `CommentItem` component displays a single comment with the author's username, creation date, and text. If the current user is the author of the comment or an admin, edit and delete buttons are displayed. The component handles the UI state for editing and deleting comments, and calls the appropriate service methods to perform these operations.

### CommentForm

The `CommentForm` component provides a form for users to add new comments to a movie. It includes:
- A textarea for entering the comment text
- Validation to ensure comments are not empty
- Error handling for API failures
- Loading state indication during submission
- Different UI states for logged-in and non-logged-in users

The component takes two props:
- `movieId`: The ID of the movie being commented on
- `onCommentAdded`: A callback function that is called when a comment is successfully added

### LoginForm

The `LoginForm` component renders a form for user login with email and password fields. It handles form validation, submission, and error display. On successful login, it calls either the onLogin or onSuccess callback.

### RegisterForm

The `RegisterForm` component renders a form for user registration with required fields (username, email, password) and optional fields (first name, last name, age, gender, country). It handles form validation, submission, and error display.

## Testing

The project uses Vitest for testing, along with React Testing Library for testing React components. The tests cover various scenarios:

- Rendering components correctly
- Form validation
- User interactions (clicking buttons, filling forms)
- API calls and service interactions
- Error handling
- Component state management
- Conditional rendering based on user authentication

Each component has its own test file with comprehensive tests for different scenarios. The tests use mocks for services to isolate the components being tested and ensure consistent test results.

### Test Structure

Tests are organized using the describe-it pattern:
- `describe` blocks group related tests
- `it` blocks define individual test cases
- `expect` statements make assertions about the component's behavior

### Mocking

Services are mocked using Vitest's mocking capabilities to isolate components from external dependencies. This allows testing components in isolation and simulating different scenarios like successful API calls, errors, and loading states.

### Test Coverage

The project aims for high test coverage to ensure reliability. Run `npm run test:coverage` to generate a coverage report and identify areas that may need additional testing.
