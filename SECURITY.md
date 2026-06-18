# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability in Nirikshak AI, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Email the maintainer directly with details of the vulnerability.
3. Include steps to reproduce, impact, and suggested fix (if any).
4. You will receive a response within **48 hours**.

## Security Best Practices for Deployment

### JWT Secret
- Generate a strong secret: `openssl rand -base64 48`
- Minimum 32 characters
- Rotate periodically in production

### Database
- Use strong, unique passwords for PostgreSQL
- Restrict database network access to the backend service only
- Enable SSL connections in production

### Environment Variables
- Never commit `.env` files to version control
- Use secrets management (e.g., Render Secrets, AWS Secrets Manager)
- Rotate credentials regularly

### CORS
- Configure `CORS_ALLOWED_ORIGINS` to your exact frontend domain
- Never use wildcard (`*`) in production

### HTTPS
- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers via Nginx

## Known Security Measures

- Stateless JWT authentication (HS256)
- Bcrypt password hashing (strength 12)
- Role-based access control (ADMIN / CANDIDATE)
- Input validation on all API endpoints
- SQL injection prevention via JPA/Hibernate
- XSS prevention via React's default escaping
