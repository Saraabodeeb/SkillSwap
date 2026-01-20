# 🚀 SkillSwap - Peer-to-Peer Learning Platform

![NodeJS](https://img.shields.io/badge/Node.js-18.x-green) ![MySQL](https://img.shields.io/badge/MySQL-8.0-blue) ![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey) ![Status](https://img.shields.io/badge/Status-Completed-success)

> **Developed by:** Sara Abodeeb

---

## 📖 Project Overview
**SkillSwap** is a web-based platform designed to democratize education by solving the problem of high costs. It creates a collaborative ecosystem where university students can exchange skills (e.g., *"I teach you Python, you teach me Graphic Design"*) using a unique time-bartering currency system called **"SkillCoins."**

### 🎥 [Watch Project Demo](https://youtu.be/imp-YS-BSao)

---

## ✨ Key Features
### 🔐 Security & Auth
* **Secure Authentication:** Implemented user registration and login using **bcrypt** for password hashing and encryption.
* **Session Management:** Secure session handling for persistent user states.

### 💬 Real-Time Interaction
* **Global Chat:** A community discussion board built using **AJAX/Fetch API** with polling integration for near-real-time updates without refreshing the page.

### 📊 Logic & Data
* **SkillCoin System:** Custom logic to track user balances, handling transactions (debit/credit) based on teaching hours.
* **Dynamic Dashboard:** Real-time tracking of learning history and coin balance via MySQL queries.

---

## 🛠️ Technical Architecture

### Tech Stack
| Component | Technology |
|-----------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Relational DB) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (DOM Manipulation) |
| **Architecture** | MVC (Model-View-Controller) Pattern, RESTful API |

### 🗄️ Database Schema (ERD)
The system uses a normalized relational database to ensure data integrity.
*(Please add your ERD screenshot here, e.g., `![ERD](./screenshots/erd.png)`)*

* **Users Table:** Stores credentials and SkillCoin balance.
* **Transactions Table:** Logs every skill exchange with timestamps.
* **Messages Table:** Stores chat history linked to users.

### 🔌 API Endpoints (Examples)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new student |
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/dashboard` | Fetch user stats & coin balance |
| `GET` | `/api/chat` | Retrieve latest community messages |

---

## 💻 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Saraabodeeb/SkillSwap.git](https://github.com/Saraabodeeb/SkillSwap.git)
   cd SkillSwap
2. **Install Dependencies**
   npm install
3. **Database Setup**
   Create a MySQL database named skillswap_db.
   Import the schema.sql file located in the /database folder.
   Configure your database credentials in db.js or .env file.
4. **Start the Server**
   node server.js
5. **Access the App** Open http://localhost:3000 in your browser.
