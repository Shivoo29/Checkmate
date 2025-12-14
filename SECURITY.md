# Security Policy

## 🔒 Security Best Practices

### For Development

1. **Never commit `.env` files**
   - All `.env` files are in `.gitignore`
   - Only commit `.env.example` files with placeholders

2. **Use Strong Credentials**
   ```bash
   # Generate a secure JWT secret
   openssl rand -hex 32

   # Generate a secure password
   openssl rand -base64 24
   ```

3. **Local Development Setup**
   ```bash
   # Copy example files
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env

   # Update with your credentials (never use defaults in production!)
   ```

### For Production

#### 🚨 CRITICAL: Before Deploying

1. **Database Credentials**
   - Change `POSTGRES_USER` and `POSTGRES_PASSWORD`
   - Use managed database services (AWS RDS, Google Cloud SQL, etc.)
   - Never use default credentials like `postgres:postgres`

2. **JWT Secret Key**
   - Generate a cryptographically secure random string:
     ```bash
     openssl rand -hex 32
     ```
   - Store in environment variables or secret manager
   - Never commit to repository

3. **Environment Variables**
   - Set `ENVIRONMENT=production`
   - Set `DEBUG=False`
   - Update `ALLOWED_ORIGINS` to your domain only
   - Configure proper CORS origins

4. **HTTPS**
   - Use HTTPS for all production traffic
   - Configure SSL/TLS certificates
   - Redirect HTTP to HTTPS

5. **Secrets Management**
   Use environment-specific secret management:
   - **AWS**: AWS Secrets Manager or Parameter Store
   - **Google Cloud**: Secret Manager
   - **Azure**: Key Vault
   - **Kubernetes**: Secrets
   - **Vercel/Netlify**: Environment Variables UI

#### Production Environment Variables

```bash
# Database (use managed service)
DATABASE_URL=postgresql://user:password@your-db-host:5432/checkmate_prod

# Redis (use managed service)
REDIS_URL=redis://your-redis-host:6379

# JWT (generate new secure key)
JWT_SECRET_KEY=<output from: openssl rand -hex 32>

# Application
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://yourdomain.com

# SMTP (for emails)
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
```

## 🛡️ Security Checklist

### Before First Commit
- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded passwords in code
- [ ] `.env.example` files use obvious placeholders
- [ ] Secrets use `YOUR_*` or `CHANGE_*` placeholders

### Before Production Deploy
- [ ] Changed all default credentials
- [ ] Generated new JWT secret key
- [ ] Configured HTTPS/SSL
- [ ] Set `DEBUG=False`
- [ ] Configured proper CORS origins
- [ ] Set up database backups
- [ ] Configured rate limiting
- [ ] Set up monitoring/logging
- [ ] Reviewed all environment variables

### Regular Security Maintenance
- [ ] Rotate JWT secrets periodically
- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Review access logs
- [ ] Audit user permissions
- [ ] Test backup restoration

## 🔍 Scanning Tools

### Pre-commit Scanning
```bash
# Install git-secrets
git clone https://github.com/awslabs/git-secrets
cd git-secrets
make install

# Configure
git secrets --install
git secrets --register-aws
```

### Dependency Scanning
```bash
# Python
pip install safety
safety check

# Node.js
npm audit
npm audit fix
```

## 📧 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@checkmate.dev
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We'll respond within 48 hours.

## 🎯 Security Features Built-In

✅ Password hashing with bcrypt (12 rounds)
✅ JWT token authentication
✅ CORS protection
✅ SQL injection prevention (SQLAlchemy ORM)
✅ XSS protection (input sanitization)
✅ HTTPS enforcement checks
✅ Security header validation
✅ Rate limiting ready
✅ Input validation with Pydantic

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Remember**: Security is a continuous process, not a one-time setup!
