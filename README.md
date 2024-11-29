# Financial Family Planner

A comprehensive web application to help families manage their finances, track expenses, and plan for their financial future.

## Features

- Family Member Profiles
  - Individual spending tracking
  - Personal savings goals
  - Customizable budgets

- Budget Management
  - Monthly/yearly budgeting
  - Category-based expense tracking
  - Shared family expenses
  - Bill splitting

- Financial Dashboard
  - Real-time expense tracking
  - Income vs. spending visualization
  - Savings progress
  - Investment portfolio overview

- Financial Goals
  - Short and long-term goal setting
  - Education savings planning
  - Retirement planning
  - Debt reduction strategies

## Tech Stack

### Frontend
- React 18
- Material-UI
- Redux Toolkit
- Recharts for data visualization
- React Router for navigation

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v18.x recommended)
- MongoDB (v6.x recommended)
- npm (v10.x recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cm777-dev/financial-family-planner.git
   cd financial-family-planner
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your configuration

4. Start the development servers:
   ```bash
   npm start
   ```

   This will start both the frontend and backend servers concurrently.
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Development

### Backend API Endpoints

- Authentication
  - POST /api/auth/register - Register a new user
  - POST /api/auth/login - Login user
  - GET /api/auth/profile - Get user profile

- Budget
  - GET /api/budget/:year/:month - Get budget for specific month
  - POST /api/budget - Create a new budget
  - PUT /api/budget/:id - Update budget
  - GET /api/budget/summary/:year/:month - Get budget summary with actual spending

### Project Structure

```
financial-family-planner/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── theme.js       # Material-UI theme
│   └── package.json
├── backend/                # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Express server
└── package.json           # Root package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
