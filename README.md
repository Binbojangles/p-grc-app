# GRC Solution Application

A comprehensive Governance, Risk, and Compliance (GRC) solution for managing controls, tasks, and compliance reviews.

## Features

- User management with role-based access control (admin, manager, reviewer)
- Controls management for tracking compliance requirements
- CMMC Level 1 and Level 2 controls integration
- Filter controls by CMMC level, category, and implementation status
- Task assignment and tracking
- Review documentation and evidence collection
- Secure file upload for compliance evidence with enhanced validation:
  - Strict file type validation with MIME type and extension cross-checking
  - Special handling for PDF files across different browsers
  - Secure file naming to prevent path traversal attacks
  - 5MB file size limit with clear user feedback
  - Client-side pre-validation for immediate user feedback
- Dashboard with compliance status overview
- Comprehensive reporting capabilities with data visualization
- Secure authentication with JWT
- Flexible token authentication supporting both header formats
- Secure password management with salt-based hashing
- Password change functionality with validation

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI, React Query, Recharts
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
│   │   │   │   ├── reports/   # Reporting functionality
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

### Secure File Upload Features

The GRC Solution includes a robust and secure file upload system for evidence attachments:

* **Strict Validation**: All uploads undergo dual validation checking both MIME type and file extension 
* **PDF Support**: Special handling for PDF files across different browsers with consistent validation
* **Secure File Storage**: Files are stored with randomized names to prevent path traversal attacks
* **Size Limits**: 5MB file size limit with clear user feedback 
* **Allowed Types**: Support for common document formats (.pdf, .txt, .doc, .docx, .xls, .xlsx)
* **Client Validation**: Pre-validation happens before upload attempts for immediate user feedback
* **Error Handling**: Clear, specific error messages guide users when issues occur
* **Resilient Processing**: Automatic ID selection ensures uploads work even after database resets
* **File Preview**: Built-in preview capability for PDF, image, and text files without downloading
* **Responsive Display**: Preview components that adapt to different screen sizes and devices

The upload system has been extensively tested across multiple browsers to ensure compatibility with various file formats, particularly PDF files which are commonly used for compliance documentation.