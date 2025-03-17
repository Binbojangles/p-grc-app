# GRC Solution Application

A comprehensive Governance, Risk, and Compliance (GRC) solution for managing controls, tasks, and compliance reviews.

## Features

- User management with role-based access control (admin, manager, reviewer)
- Controls management for tracking compliance requirements
- CMMC Level 1 and Level 2 controls integration
- Filter controls by CMMC level, category, and implementation status
- Task assignment and tracking
- Review documentation and evidence collection
- Dashboard with compliance status overview
- Secure authentication with JWT
- Flexible token authentication supporting both header formats
- Secure password management with salt-based hashing
- Password change functionality with validation

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI, React Query
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Containerization**: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)

## Getting Started

### Running with Docker

1. Clone the repository:
   ```
   git clone <repository-url>
   cd grc-app
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up --build -d
   ```

3. The application will be available at:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000

4. Default admin credentials:
   - Email: admin@example.com
   - Password: admin123

### Local Development

#### Backend

1. Navigate to the server directory:
   ```
   cd app/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_change_in_production
   DB_NAME=grc_db
   DB_USER=postgres
   DB_PASSWORD=postgres123
   DB_HOST=localhost
   DB_PORT=5432
   DB_SSL=false
   ```

4. Start the development server:
   ```
   npm run dev
   ```

#### Frontend

1. Navigate to the client directory:
   ```
   cd app/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Database Initialization

The database is automatically initialized with sample users and CMMC controls during container startup. The initialization process:

1. Creates tables and default users (admin, manager, user)
2. Loads controls from the JSON files:
   - `cmmc_level1_controls.json` - CMMC Level 1 controls
   - `cmmc_level2_controls.json` - CMMC Level 2 controls

If you need to manually seed the database, you can run:

```
docker exec -it <api-container-name> node seed-db.js
```

## Project Structure

```
grc-app/
├── app/
│   ├── client/             # React frontend
│   │   ├── public/         # Static files
│   │   ├── src/            # Source code
│   │   │   ├── components/ # Reusable components
│   │   │   ├── contexts/   # React contexts
│   │   │   ├── layouts/    # Page layouts
│   │   │   ├── pages/      # Page components
│   │   │   │   ├── controls/  # Controls management
│   │   │   │   ├── tasks/     # Tasks management
│   │   │   │   ├── reviews/   # Reviews management
│   │   │   │   └── ...
│   │   │   ├── routes/     # Application routes
│   │   │   ├── services/   # API services
│   │   │   └── types/      # TypeScript types
│   │   └── Dockerfile      # Frontend Docker configuration
│   │
│   └── server/             # Node.js backend
│       ├── middleware/     # Express middleware
│       ├── models/         # Sequelize models
│       ├── routes/         # API routes
│       ├── Dockerfile      # Backend Docker configuration
│       └── index.js        # Entry point
│
├── cmmc_level1_controls.json  # CMMC Level 1 controls data
├── cmmc_level2_controls.json  # CMMC Level 2 controls data
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## API Documentation

The backend API provides the following endpoints:

- **Authentication**
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user
  - `PUT /api/auth/password` - Change user password (authenticated)
  - `PUT /api/auth/profile` - Update user profile (authenticated)

- **Users**
  - `GET /api/users` - Get all users (admin only)
  - `GET /api/users/:id` - Get user by ID (admin only)
  - `POST /api/users` - Create user (admin only)
  - `PUT /api/users/:id` - Update user (admin only)
  - `DELETE /api/users/:id` - Delete user (admin only)

- **Controls**
  - `GET /api/controls` - Get all controls
  - `GET /api/controls/:id` - Get control by ID
  - `POST /api/controls` - Create control (admin/manager)
  - `PUT /api/controls/:id` - Update control (admin/manager)
  - `DELETE /api/controls/:id` - Delete control (admin/manager)

- **Tasks**
  - `GET /api/tasks` - Get all tasks (with optional filters)
  - `GET /api/tasks/:id` - Get task by ID
  - `POST /api/tasks` - Create task (admin/manager)
  - `PUT /api/tasks/:id` - Update task (admin/manager or assigned user)
  - `DELETE /api/tasks/:id` - Delete task (admin/manager)

- **Reviews**
  - `GET /api/reviews` - Get all reviews (with optional filters)
  - `GET /api/reviews/:id` - Get review by ID
  - `POST /api/reviews` - Create review (admin/manager)
  - `PUT /api/reviews/:id` - Update review (admin/manager)

## Application Features

### Controls Management
- View all controls with filtering by level, category, and implementation status
- Create new controls with detailed information
- Edit existing controls to update implementation status and other details

### Tasks Management
- View all tasks with filtering by status, priority, and assignment
- Create new tasks associated with controls
- Assign tasks to users and track progress

### Reviews Management
- Document compliance reviews for controls
- Track review status (compliant, non-compliant, partially-compliant)
- Schedule next review dates based on findings

## Rebuilding the Application

To rebuild the application from scratch, run:

```
docker-compose down -v && docker-compose up --build -d --no-cache
```

This will:
1. Stop all containers and remove volumes
2. Rebuild all images without using cache
3. Start the application in detached mode

## Security Considerations

- JWT authentication with token expiration
- Support for both `x-auth-token` and `Authorization: Bearer` token formats
- Password hashing with crypto module using PBKDF2 algorithm
- Secure salt generation and management
- Role-based access control
- Input validation
- Security headers
- CORS configuration

## License

[MIT License](LICENSE) 