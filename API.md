# Nirikshak AI — API Reference

Base URL: `https://your-backend-domain.com/api`

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth Endpoints

### POST `/auth/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "CANDIDATE",
  "name": "John Doe"
}
```

---

## Exam Session Endpoints

### POST `/sessions/start` 🔒
Start a new proctored exam session.

**Request Body:**
```json
{
  "examId": "uuid-of-exam"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "startTime": "2024-06-18T06:00:00Z",
  "status": "ACTIVE"
}
```

### POST `/sessions/{sessionId}/end` 🔒
End an active exam session.

---

## Violation Endpoints

### GET `/violations/{sessionId}` 🔒
Get all violations for a session.

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "GAZE_DEVIATION",
    "timestamp": "2024-06-18T06:05:30Z",
    "severity": "HIGH",
    "details": "Gaze deviated > 25° for 3s"
  }
]
```

### GET `/violations/summary/{sessionId}` 🔒
Get violation summary statistics.

---

## WebSocket

### WS `/ws/proctor/{sessionId}`
Real-time proctoring stream. Send base64 frames, receive violation events.

**Send:**
```json
{ "frame": "data:image/jpeg;base64,..." }
```

**Receive:**
```json
{
  "gazeScore": 0.87,
  "violations": [],
  "faceDetected": true,
  "multipleFaces": false
}
```

---

## AI Vision Endpoints (Python FastAPI)

Base URL: `http://python-ai:8000`

### POST `/analyze`
Analyze a single frame for gaze and pose.

**Request Body:**
```json
{ "frame": "base64-encoded-jpeg" }
```

**Response:**
```json
{
  "gaze_score": 0.91,
  "yaw": 3.2,
  "pitch": -1.1,
  "face_count": 1,
  "violations": []
}
```

### GET `/health`
Health check for the AI service.

```json
{ "status": "ok", "model": "mediapipe" }
```
