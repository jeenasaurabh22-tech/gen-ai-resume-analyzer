# 🚀 GenAI Resume Analyzer

An AI-powered Resume Analyzer that evaluates resumes against job descriptions, calculates ATS compatibility, identifies skill gaps, and generates personalized interview preparation reports using Google's Gemini AI.

Built using the MERN Stack with Docker support and deployed on AWS ECS.

---

## ✨ Features

- 📄 Upload Resume (PDF)
- 🤖 AI-powered Resume Analysis using Google Gemini
- 📊 ATS Match Score
- 💼 Job Description Matching
- 🧠 Personalized Interview Questions
- 🎯 Skill Gap Analysis
- 📅 AI-generated Preparation Roadmap
- 🔐 Secure Authentication (JWT)
- ☁️ Dockerized Application
- 🚀 AWS ECS Deployment
- 📱 Responsive Modern UI

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- SCSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- PDF Parser

### AI
- Google Gemini API

### DevOps
- Docker
- AWS ECS
- Amazon ECR

---

# 📷 Screenshots

Add screenshots here.

```
Home Page
Dashboard
Resume Upload
Generated Report
Interview Questions
```

---

# ⚙️ Project Structure

```
GenAI-Resume-Analyzer/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

# 🔥 Workflow

```
User Uploads Resume
        │
        ▼
Resume PDF Parsing
        │
        ▼
Extract Resume Text
        │
        ▼
Job Description Input
        │
        ▼
Google Gemini Analysis
        │
        ▼
Generate Report
        │
        ├── ATS Score
        ├── Skill Gap Analysis
        ├── Technical Questions
        ├── Behavioral Questions
        ├── Preparation Plan
        └── Improvement Suggestions
```

---

# 📊 Generated Report Includes

- ATS Match Score
- Resume Strengths
- Weaknesses
- Missing Skills
- Technical Interview Questions
- Behavioral Interview Questions
- HR Interview Questions
- 30-Day Preparation Plan
- Resume Improvement Suggestions

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/genai-resume-analyzer.git

cd genai-resume-analyzer
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create `.env` inside backend.

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret

GOOGLE_GEMINI_API_KEY=your_api_key

CLIENT_URL=http://localhost:5173
```

---

# 🐳 Docker

Build Image

```bash
docker build -t resume-analyzer .
```

Run Container

```bash
docker run -p 3000:3000 resume-analyzer
```

---

# ☁️ AWS Deployment

This project is deployed using:

- Amazon ECS
- Amazon ECR
- Docker
- Application Load Balancer

Deployment Steps:

1. Build Docker Image
2. Push Image to Amazon ECR
3. Update ECS Task Definition
4. Deploy ECS Service
5. Access through Load Balancer URL
6. AWS-DEPLOYMENT-URL->http://docker-awsalb-1094310998.ap-northeast-1.elb.amazonaws.com/

---

# 🔒 Authentication

- Register
- Login
- JWT Access Token
- Protected Routes
- Secure API Access

---

# 📈 Future Improvements

- Redis Caching
- Background Job Queue
- Resume History
- Multiple Resume Comparison
- AI Resume Builder
- LinkedIn Profile Analysis
- Email Report Generation
- Resume Templates
- Export Report as PDF
- AI Career Recommendation
- Cover Letter Generator
- Multi-language Support

---

# 🧪 API Endpoints

## Authentication

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/get-me
```

## Resume

```
POST /api/resume/upload
```

## AI

```
POST /api/interview/generate
GET  /api/interview/:id
```

---

# 📄 Sample Analysis

```
ATS Score
90%

Matched Skills
✔ React
✔ Node.js
✔ Express
✔ MongoDB

Missing Skills
✖ Redis
✖ Docker Compose
✖ AWS Lambda

Interview Readiness
Excellent

Recommended Preparation
7 Days
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork Repository
2. Create Feature Branch

```
git checkout -b feature/new-feature
```

3. Commit Changes

```
git commit -m "Added New Feature"
```

4. Push Branch

```
git push origin feature/new-feature
```

5. Open Pull Request

---

# ⭐ Show Your Support

If you like this project, please consider giving it a ⭐ on GitHub.

---

# 👨‍💻 Author

**Saurabh Jeena**

GitHub: https://github.com/jeenasaurabh22-tech

LinkedIn: https://www.linkedin.com/in/saurabh-jeena-334b13330/

---

# 📜 License

This project is licensed under the MIT License.
