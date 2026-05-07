# TaskAI — AI-Powered Task Manager

![TaskAI](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat&logo=mongodb)
![Claude AI](https://img.shields.io/badge/Claude-AI-7c6bff?style=flat)

A full-stack productivity app that uses **Claude AI** to automatically analyze, prioritize, and suggest improvements for your tasks.

## 🚀 Live Demo
[https://your-app.vercel.app](https://your-app.vercel.app) ← *(deploy and update this link)*

---

## ✨ Features

- **🔐 JWT Authentication** — Secure register/login with bcrypt password hashing
- **✅ Full CRUD Tasks** — Create, read, update, delete tasks with rich metadata
- **🤖 AI Task Analysis** — Claude AI analyzes all your tasks and gives smart prioritization + tips
- **🤖 AI Auto-Fill** — AI fills in task description, priority, time estimate from just a title
- **📊 Analytics Dashboard** — Pie charts and bar graphs showing task status and priorities
- **🔍 Filter & Search** — Filter by status, priority, or search by keyword
- **⏰ Due Dates & Time Estimates** — Track deadlines with overdue alerts
- **🏷️ Tags** — Organize tasks with custom tags

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **AI** | Anthropic Claude API (claude-sonnet-4) |
| **Auth** | JWT + bcryptjs |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
ai-task-manager/
├── backend/
│   ├── src/
│   │   ├── models/       # Mongoose schemas (User, Task)
│   │   ├── routes/       # Express routes (auth, tasks, ai)
│   │   ├── middleware/   # JWT auth middleware
│   │   └── server.js     # App entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/        # Login, Register, Dashboard, Tasks
│   │   ├── components/   # Layout, Sidebar
│   │   ├── context/      # AuthContext (global state)
│   │   └── App.jsx
│   └── index.html
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) — free)
- Anthropic API key ([get one here](https://console.anthropic.com))

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-task-manager.git
cd ai-task-manager
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Anthropic API key
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-task-manager
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-xxxx
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Connect GitHub repo to Vercel — auto deploys!
```

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Set root directory to `backend`
4. Add environment variables in Render dashboard
5. Deploy!

---

## 📸 Screenshots

> *(Add screenshots here after running the app)*

---

## 🧠 What I Learned

- Building REST APIs with Express.js and JWT authentication
- MongoDB schema design with Mongoose
- React Context API for global state management
- Integrating third-party AI APIs (Anthropic Claude)
- React Router v6 for client-side routing
- Data visualization with Recharts
- Full-stack deployment with Vercel + Render

---

## 📄 License

MIT — feel free to use this for your own portfolio!

---

*Built with ❤️ using React, Node.js, MongoDB, and Claude AI*
