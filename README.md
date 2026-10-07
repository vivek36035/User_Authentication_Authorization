# Secure User Authentication & Authorization API

A robust, secure RESTful API built with **Node.js, Express, and MongoDB** that handles user registration, authentication, and role-based authorization. It features automated OTP-based email verification, JSON Web Token (JWT) session management, and an Admin Dashboard API.

## 🚀 Features

- **User Registration & Login:** Secure account creation with automated password hashing using `bcryptjs`.
- **OTP Verification:** Automated 6-digit OTP sent via email (Nodemailer) to verify new accounts before they can log in.
- **Forgot & Reset Password:** Users can request a password reset OTP and set a new password securely.
- **JWT Authentication:** Stateless session management using JSON Web Tokens.
- **Role-Based Access Control (RBAC):** Distinct access levels for `user` and `admin`.
- **Admin Dashboard API:** Protected routes allowing administrators to view and manage (delete) registered users.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Security:** JSON Web Tokens (JWT), bcryptjs
- **Email Service:** Nodemailer

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "User Authentication and Authorization"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/auth_db
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start on port 5000 and automatically seed a default Admin account (`vivekzambre41@gmail.com` / `adminpassword`) on the first run.*

## 📡 API Endpoints

### 🔐 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Requires Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user & send OTP | No |
| `POST` | `/verify-otp` | Verify email using 6-digit OTP | No |
| `POST` | `/login` | Authenticate user & return JWT | No |
| `POST` | `/forgot-password`| Send password reset OTP | No |
| `POST` | `/reset-password` | Verify OTP and set new password | No |

### 🛡️ Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Requires Auth | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get a list of all registered users | Yes | `admin` |
| `DELETE` | `/users/:id` | Delete a specific user by ID | Yes | `admin` |

## 🧪 Testing with Postman

1. Hit the `/register` endpoint to create a user.
2. Check your terminal (or email) for the generated OTP.
3. Use the `/verify-otp` endpoint to activate the account.
4. Use the `/login` endpoint to receive your `Bearer Token`.
5. Add the Token to your Postman Headers (`Authorization: Bearer <token>`) to access the Admin routes.
