# Checkmate - Quick Start Guide

Get your QA testing platform running in **5 minutes**!

## 🚀 Quick Setup (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose installed
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/checkmate.git
cd checkmate
```

### 2. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 8000)
- Frontend app (port 5173)

### 3. Access the Platform
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

### 4. Create Account
1. Go to http://localhost:5173/register
2. Register with your email
3. Start testing!

## 📦 Manual Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend available at: http://localhost:8000

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env if needed

# Start development server
npm run dev
```

Frontend available at: http://localhost:5173

### Bot Engine Setup
```bash
cd bot-engine

# Install dependencies
npm install

# Install browsers
npx playwright install

# Test bot engine
npm run dev
```

## 🎯 First Test

1. **Register/Login** at http://localhost:5173

2. **Create a Project**:
   - Click "Create New Project"
   - Name: "My First Test"
   - URL: "https://example.com"
   - Click "Create"

3. **Run a Test**:
   - Click "Run Test" on your project
   - Select test types (or "Full Test")
   - Watch real-time progress
   - View results!

4. **Download Report**:
   - Click "Download PDF Report"
   - Share with your team

## 📊 What Gets Tested?

### Automated Bot Tests
✅ **Authentication**
- Login/registration flows
- Password reset functionality
- Session management

✅ **Performance**
- Page load time (<3s target)
- Core Web Vitals (LCP, FID, CLS)
- Resource optimization

✅ **Security**
- HTTPS enforcement
- Security headers
- Mixed content detection
- CSRF protection

✅ **UI/UX**
- Responsive design (mobile, tablet, desktop)
- Broken links
- Console errors
- Accessibility (WCAG)

### Manual Tests (Optional)
- Custom testing forms
- Screenshot uploads
- Team collaboration
- Comments & annotations

## 🛠️ Development

### Database Migrations
```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1
```

### Run Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# Bot tests
cd bot-engine
npm run test
```

### Access Database
```bash
# Via Docker
docker exec -it checkmate-postgres psql -U postgres -d checkmate_dev

# Direct connection
psql postgresql://postgres:postgres@localhost:5432/checkmate_dev
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000
# Kill the process or change the port in docker-compose.yml
```

### Database Connection Error
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Clear npm cache
cd frontend
rm -rf node_modules package-lock.json
npm install

# Restart frontend
docker-compose restart frontend
```

### Bot Tests Failing
```bash
# Reinstall Playwright browsers
cd bot-engine
npx playwright install --force

# Check browser availability
npx playwright install-deps
```

## 📚 Next Steps

1. **Explore Features**:
   - Create multiple projects
   - Run different test types
   - Generate reports

2. **Customize**:
   - Add custom test configurations
   - Set up webhooks for notifications
   - Configure CI/CD integration

3. **Scale**:
   - Add more team members
   - Set up scheduled tests
   - Integrate with your workflow

4. **Upgrade**:
   - Check `future_plan.md` for upcoming features
   - Contribute to the project
   - Request features via GitHub issues

## 🤝 Need Help?

- **Documentation**: https://docs.checkmate.dev
- **GitHub Issues**: https://github.com/yourusername/checkmate/issues
- **Discord**: https://discord.gg/checkmate
- **Email**: support@checkmate.dev

## 🎉 Success!

You now have a production-ready QA testing platform!

**Next**: Run your first test and see the magic happen! 🚀

---

**Made with ❤️ by the Checkmate team**
