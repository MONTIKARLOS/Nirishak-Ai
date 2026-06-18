# Nirikshak AI — Frequently Asked Questions

## General

### What is Nirikshak AI?
Nirikshak AI is an open-source AI-powered online exam proctoring system that uses computer vision to monitor candidates in real-time. It detects gaze deviation, multiple faces, and suspicious behaviour during exams.

### Is it free to use?
Yes! Nirikshak AI is open-source and licensed under the MIT License.

### What languages/frameworks are used?
- **Frontend**: React 18 + Material UI v5
- **Backend**: Spring Boot 3.x (Java 17)
- **AI Service**: Python 3.10 + FastAPI + MediaPipe
- **Database**: PostgreSQL 15
- **Orchestration**: Docker + Docker Compose

---

## Setup

### What are the minimum system requirements?
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: Modern multi-core processor
- **Camera**: Webcam required for candidates
- **Browser**: Chrome 90+ or Firefox 88+

### Can I run it without Docker?
Yes. Each service can be run independently:
- Frontend: `npm start` inside `frontend/`
- Backend: `mvn spring-boot:run` inside `backend/`
- Python AI: `uvicorn main:app --reload` inside `python-ai/`

### How do I reset the database?
```bash
docker-compose down -v
docker-compose up postgres -d
```

---

## Features

### What violations does Nirikshak AI detect?
| Violation | Description |
|-----------|-------------|
| Gaze Deviation | Eyes looking away from screen |
| Head Turn | Significant left/right/up/down head movement |
| Multiple Faces | More than one person detected |
| No Face | Candidate leaves frame |
| Tab Switch | Browser focus lost |

### Can I adjust detection sensitivity?
Yes! Configure thresholds in `.env`:
```
YAW_THRESHOLD=25       # degrees left/right
PITCH_THRESHOLD=20     # degrees up/down
GAZE_YAW_THR=20
GAZE_PITCH_THR=15
GAZE_WEIGHT=0.4
```

---

## Deployment

### Where can I deploy this?
Recommended platforms:
- **Frontend**: Vercel (free tier)
- **Backend**: Render.com (free tier)
- **Python AI**: Render.com or Railway
- **Database**: Render PostgreSQL or Supabase

### Is HTTPS required?
Yes, webcam access requires HTTPS in production browsers.

---

## Security

### How are passwords stored?
Passwords are hashed with Bcrypt (strength 12). Plain passwords are never stored.

### How long are JWT tokens valid?
Default: 24 hours. Configure via `JWT_EXPIRATION_MS` in environment variables.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to Nirikshak AI.
