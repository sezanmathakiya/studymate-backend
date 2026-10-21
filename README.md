# StudyMate Backend API

A RESTful backend API for **StudyMate**, an AI-powered student study and task management application. It provides authentication, subject and task management, study file storage, progress tracking, and AI-powered study assistance.

## 🌐 Project Links

- **Frontend:** https://github.com/sezanmathakiya/studymate-frontend
- **Backend Repository:** https://github.com/sezanmathakiya/studymate-backend
- **Live Application:** https://studymate-frontend-rgh9.onrender.com
- **Backend API:** https://studymate-backend-1-izz3.onrender.com

## ✨ Features

- **Authentication:** User signup and login with JWT authentication and bcrypt password hashing.
- **Subject Management:** Create, retrieve, update, and delete subjects.
- **Task Management:** Manage tasks with descriptions, priorities, statuses, due dates, and subject associations.
- **Progress Tracking:** Overall progress, subject-wise progress, and recent activity statistics.
- **Study File Management:** Upload, retrieve, and delete study materials using Cloudinary.
- **AI Study Assistant:** Generate educational responses using the Google Gemini API.
- **Email Reminders:** Scheduled study reminder functionality.
- **User Data Isolation:** Scope subject, task, and file operations to the authenticated user.
- **API Protection:** Authentication middleware, request rate limiting, request validation, and Helmet security headers.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| express-rate-limit | Rate limiting |
| Helmet | HTTP security headers |
| Google Gemini API | AI-powered study assistance |
| Multer | File upload handling |
| Cloudinary | Cloud file storage |
| node-cron / project cron module | Scheduled reminders |
| dotenv | Environment configuration |

## 📁 Project Structure

```text
studymate-backend/
├── config/
│   └── cloudinary.js
├── controller/
│   ├── ai.controller.js
│   ├── file.controller.js
│   ├── subject.controller.js
│   ├── task.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   ├── upload.middleware.js
│   └── validation.middleware.js
├── model/
├── route/
│   ├── ai.route.js
│   ├── file.route.js
│   ├── subject.route.js
│   ├── task.route.js
│   └── user.route.js
├── cron/
│   └── reminder.cron.js
├── index.js
├── package.json
└── .gitignore
```

*Note: This structure highlights the main files; your repository may contain additional files.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Google Gemini API key
- Cloudinary account for file storage

### 1. Clone the repository

```bash
git clone https://github.com/sezanmathakiya/studymate-backend.git
cd studymate-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Configure any additional Cloudinary and email-related variables required by your project configuration.

**Never commit `.env` files, API keys, database credentials, or JWT secrets to GitHub.**

### 4. Start the server

```bash
npm start
```

The server uses `process.env.PORT` when available and falls back to port `3000`.

### 5. Verify the API

Open the backend root URL in your browser:

```text
http://localhost:3000/
```

The deployed API root is:

https://studymate-backend-1-izz3.onrender.com

The root endpoint should return a response indicating that the Student Study Management API is running.

## 🔌 API Routes

Base URL:

```text
/api
```

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/user/...` | User authentication routes | Depends on route |
| GET | `/api/subjects` | Retrieve authenticated user's subjects | Required |
| POST | `/api/subjects/create` | Create a subject | Required |
| PUT | `/api/subjects/:id` | Update an owned subject | Required |
| DELETE | `/api/subjects/:id` | Delete an owned subject | Required |
| GET | `/api/tasks` | Retrieve authenticated user's tasks | Required |
| POST | `/api/tasks/create` | Create a task | Required |
| GET | `/api/tasks/progress` | Overall task progress | Required |
| GET | `/api/tasks/progress/subjects` | Subject-wise task progress | Required |
| GET | `/api/tasks/activity` | Recent task activity | Required |
| PUT | `/api/tasks/:id` | Update an owned task | Required |
| DELETE | `/api/tasks/:id` | Delete an owned task | Required |
| GET | `/api/files` | Retrieve authenticated user's files | Required |
| POST | `/api/files/upload` | Upload a study file | Required |
| DELETE | `/api/files/:id` | Delete an owned file | Required |
| POST | `/api/ai` | Send a question to the AI assistant | Required |

*The exact signup/login paths and any additional routes are defined in the route files. Check those files before documenting the detailed authentication endpoints.*

## 🔐 Authentication

Protected endpoints use JWT-based authentication. Include a valid token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Requests without valid authentication are expected to be rejected by protected routes.

## 🛡️ Security

The backend includes:

- Password hashing with bcryptjs.
- JWT authentication middleware.
- User-scoped database queries for subjects, tasks, and files.
- Input validation for relevant subject and task operations.
- Rate limiting for API requests.
- Helmet security headers.
- CORS configuration through the `FRONTEND_URL` environment variable.
- Environment-based configuration for secrets.

Unauthenticated API checks and basic cross-account data visibility checks have been performed. These checks do not constitute a complete security audit.

## 🚀 Deployment

The backend is deployed on Render.

For deployment:

1. Connect the backend GitHub repository to Render.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. Configure the required environment variables in Render.
5. Deploy the service and verify the backend root endpoint.

## 👨‍💻 Author

**Sezan Mathakiya**

MCA Student | Node.js / Backend Developer

GitHub: https://github.com/sezanmathakiya

---

Built with Node.js, Express.js, MongoDB, and Google Gemini to help students organize their learning.
