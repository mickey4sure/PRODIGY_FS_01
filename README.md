# AegisAuth — Secure Full-Stack MVC Authentication System

A secure, minimal, and highly aesthetic full-stack user authentication system built using Node.js, Express, and MongoDB. Designed following clean MVC (Model-View-Controller) architecture guidelines. 

Includes an **Offline Fallback Database Mode** using a local JSON file store (`data/users.json`) so the project can be run and tested instantly even if a local MongoDB instance is not active.

---

## Key Features

* **Secure Authentication**: Password hashing using `bcryptjs` and session authentication using JSON Web Tokens (JWT).
* **Role-Based Access Control (RBAC)**: Supports `user` and `admin` authorization profiles.
* **Modern & Minimal UI**: Styled with a dark-theme-first cyber-minimalist design system featuring glassmorphic forms, glowing accents, and smooth view transitions.
* **Interactive Validations**: Full client-side and server-side safety checks (email formats, password lengths, matching credentials).
* **Server Ping Status Check**: Interactive dashboard control to ping the API and verify JWT validity dynamically.
* **Seamless Local Fallback**: Dynamic database failover. If MongoDB is offline, the app switches to storing accounts locally in `data/users.json` automatically.

---

## Tech Stack

* **Backend**: Node.js, Express, Mongoose, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), CORS.
* **Frontend**: HTML5, Vanilla JavaScript, Vanilla CSS.
* **Database**: MongoDB (Standard Mode) / JSON File Store (Fallback Mode).

---

## Project Structure

```text
Prodigy/
├── config/
│   └── db.js                 # DB connection setup & timeout handling
├── controllers/
│   └── authController.js     # Signup, Login, and Profile fetch logic
├── middleware/
│   └── authMiddleware.js     # JWT token validation
├── models/
│   └── User.js               # Dual-mode (Mongoose/Mock) User schema
├── public/
│   ├── css/
│   │   └── style.css         # Custom cyber-minimalist style system
│   ├── js/
│   │   └── app.js            # Client-side form handlers & state management
│   └── index.html            # Single Page Application template
├── routes/
│   └── authRoutes.js         # API endpoint maps
├── .env                      # Environment config keys
├── .gitignore                # Git exclusions
├── package.json              # App definitions and launch scripts
└── server.js                 # App entry point
```

---

## Local Setup & Quick Start

### 1. Installation
Clone the repository, navigate into the directory, and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder with the following variables:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/auth_db
JWT_SECRET=supersecretkey_change_me_in_production_987654321
NODE_ENV=development
```

### 3. Launch the Server
Start the live-reloading dev environment using Nodemon:
```bash
npm run dev
```

* The server starts on: **[http://localhost:3000](http://localhost:3000)**.
* If MongoDB is running locally on port `27017`, the app will connect to it.
* If MongoDB is not active, the console will print a warning and automatically activate the JSON fallback database (`data/users.json`).
