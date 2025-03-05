# LeafGraph Server

A Node.js backend with an extensible database connection layer, starting with MongoDB and designed to be extended to support PostgreSQL, MySQL, and other databases.

## Features

- **Extensible Database Layer**: Abstract database operations with support for multiple database types
- **MongoDB Integration**: Complete MongoDB support with Mongoose
- **Secure API**: JWT authentication, input validation, and security best practices
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling and validation
- **TypeScript**: Type-safe codebase
- **Testing**: Jest testing framework setup

## Project Structure

```
├── src/
│   ├── api/                  # API-related code
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   └── validations/      # Request validation schemas
│   ├── config/               # Configuration files
│   ├── db/                   # Database layer
│   │   ├── interfaces/       # Database interfaces
│   │   └── providers/        # Database implementations
│   ├── middleware/           # Express middleware
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   └── index.ts              # Application entry point
├── tests/                    # Test files
├── .env.example              # Environment variables example
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

### Development

Start the development server:

```
npm run dev
```

### Production

Build and start the production server:

```
npm run build
npm start
```

## Database Support

### MongoDB (Current)

The application currently supports MongoDB through Mongoose.

### Future Database Support

The architecture is designed to be extended to support:

- PostgreSQL
- MySQL
- Other databases

## API Endpoints

### User Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a user by ID
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- `POST /api/users/login` - Authenticate a user

## Extending the Database Layer

To add support for a new database:

1. Create a new provider in `src/db/providers/` that implements the `DatabaseProvider` interface
2. Update the `DatabaseFactory` to support the new database type
3. Add configuration for the new database in the `.env` file and `config.ts`

## License

This project is licensed under the ISC License. 