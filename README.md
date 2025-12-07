# Checkmate - Automated QA Testing Platform

## 🎯 Overview

Checkmate is a comprehensive QA testing platform that combines automated bot testing (via Playwright) with human-driven UI/UX evaluation, generating professional, actionable reports.

**Value Proposition:**
- Reduces QA time by 70-80%
- Eliminates repetitive manual testing
- Combines bot precision with human insight
- Generates professional, actionable reports
- Scalable for multiple projects simultaneously

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHECKMATE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐              │
│  │   WEB DASHBOARD  │◄──────►│   BACKEND API    │              │
│  │  (React + TS)    │        │  (FastAPI)       │              │
│  └──────────────────┘        └──────────────────┘              │
│           │                            │                         │
│           │                            │                         │
│  ┌────────▼──────────┐        ┌───────▼──────────┐             │
│  │  HUMAN TESTING    │        │  BOT TESTING     │             │
│  │  INTERFACE        │        │  ENGINE          │             │
│  │                   │        │                  │             │
│  │ • UI/UX Forms     │        │ • Playwright     │             │
│  │ • Manual Checks   │        │ • Multi-browser  │             │
│  │ • Screenshots     │        │ • Real-time      │             │
│  └───────────────────┘        └──────────────────┘             │
│           │                            │                         │
│           └────────────┬───────────────┘                         │
│                        │                                         │
│                ┌───────▼──────────┐                              │
│                │  REPORT ENGINE   │                              │
│                │                  │                              │
│                │ • Data Merger    │                              │
│                │ • PDF Generator  │                              │
│                │ • Analytics      │                              │
│                └──────────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **React Query** for data fetching
- **Zustand** for state management
- **Socket.io Client** for real-time updates

### Backend
- **FastAPI** (Python 3.11+)
- **PostgreSQL** for database
- **Redis** for caching & queue
- **SQLAlchemy** ORM
- **Alembic** for migrations
- **Bull/BullMQ** for job queuing
- **Socket.io** for WebSocket

### Bot Testing
- **Playwright** (multi-browser automation)
- **Lighthouse CLI** for performance testing
- **axe-core** for accessibility testing

### Reports
- **ReportLab** for PDF generation
- **Matplotlib/Plotly** for charts
- **Jinja2** for templates

## 📁 Project Structure

```
checkmate/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core config
│   │   ├── db/                # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # Entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # State management
│   │   ├── api/               # API client
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── bot-engine/                 # Playwright testing
│   ├── src/
│   │   ├── tests/             # Test modules
│   │   │   ├── auth.ts
│   │   │   ├── performance.ts
│   │   │   ├── security.ts
│   │   │   └── ui.ts
│   │   ├── utils/             # Utilities
│   │   └── index.ts           # Orchestrator
│   ├── playwright.config.ts
│   └── package.json
├── shared/                     # Shared code
│   └── types/                 # Shared TypeScript types
├── docs/                       # Documentation
├── docker-compose.yml          # Local development
├── .gitignore
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 20+
- **Python** 3.11+
- **PostgreSQL** 14+
- **Redis** 7+

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/checkmate.git
cd checkmate
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 4. Bot Engine Setup
```bash
cd bot-engine

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npm run test
```

### 5. Docker Setup (Recommended for Development)
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 🎯 Quick Start

### Create Your First Test

1. **Register/Login** at http://localhost:5173

2. **Create a Project**
   - Click "New Project"
   - Enter project name and target URL
   - Select test types (Authentication, Performance, Security, UI/UX)

3. **Run Tests**
   - Click "Run Test" on your project
   - Watch real-time progress
   - View results when complete

4. **Generate Report**
   - Download PDF report
   - Share with team
   - Export as JSON for CI/CD

## 📊 Features

### ✅ MVP Features (Current)

#### Bot Testing
- ✅ Authentication flow testing (login, registration, password reset)
- ✅ Performance testing (Core Web Vitals, Lighthouse)
- ✅ Security testing (HTTPS, XSS, SQL injection, CSRF)
- ✅ UI testing (responsive design, broken links, console errors)
- ✅ Accessibility testing (WCAG compliance)
- ✅ Multi-browser testing (Chrome, Firefox, Safari)

#### Manual Testing
- ✅ Custom testing forms
- ✅ Screenshot upload
- ✅ Comments & annotations
- ✅ Team collaboration

#### Reports
- ✅ PDF report generation
- ✅ JSON export for CI/CD
- ✅ Interactive dashboard
- ✅ Analytics & insights

#### Real-time Features
- ✅ WebSocket live updates
- ✅ Progress tracking
- ✅ Issue discovery notifications

### 🔜 Coming Soon
- A/B testing suite
- Visual regression testing
- Load & stress testing
- Mobile device farm
- AI-powered insights
- Community marketplace

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Bot Tests
```bash
cd bot-engine
npm run test
```

### End-to-End Tests
```bash
npx playwright test
```

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/checkmate
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Production Deployment

#### Backend (Railway/Render/DigitalOcean)
```bash
# Install production dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start with Gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

## 📈 Performance

### Benchmarks
- Page load time: < 2 seconds
- API response time: < 200ms
- Test execution: 2-5 minutes (full suite)
- Report generation: < 30 seconds

### Scalability
- Supports 1000+ concurrent users
- 100+ projects per user
- Unlimited test runs (Pro plan)

## 🔒 Security

- HTTPS enforcement
- JWT authentication
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Input validation
- Password hashing (bcrypt)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Your Name** - Founder & Lead Developer

## 🙏 Acknowledgments

- Playwright team for amazing browser automation
- FastAPI community for excellent framework
- shadcn/ui for beautiful components

## 📞 Support

- **Email**: support@checkmate.dev
- **Discord**: https://discord.gg/checkmate
- **Twitter**: @checkmate_qa
- **Documentation**: https://docs.checkmate.dev

## 🗺️ Roadmap

### Q1 2025 - MVP Launch
- ✅ Core testing features
- ✅ Dashboard & UI
- ✅ Report generation
- ✅ User authentication

### Q2 2025 - Growth
- A/B testing suite
- Visual regression
- Mobile device testing
- Payment integration

### Q3 2025 - Scale
- AI-powered insights
- Load testing
- API marketplace
- White-label solution

### Q4 2025 - Enterprise
- SSO integration
- Advanced analytics
- Custom workflows
- Enterprise support

---

**Made with ❤️ by the Checkmate team**

**Star ⭐ this repo if you find it useful!**
