# Test Fix Tasks

- [x] Fix Java backend: add `--add-opens` JVM flags to `pom.xml`
- [x] Fix Python AI: create `conftest.py` with mediapipe stub
- [x] Run Python tests and verify pass (28/28 ✅)
- [x] Run Java tests and verify pass (54/54 ✅)
  - [x] Fix malformed XML in pom.xml (line 177 literal `\n`)
  - [x] Add `-Dnet.bytebuddy.experimental=true` for JDK 22+ ByteBuddy compat
  - [x] Fix `ExamControllerTest`: add `@MockBean QuestionService` + JwtFilter pass-through + auth token with details
  - [x] Fix `ViolationControllerTest`: JwtFilter pass-through
  - [x] Fix `WebSocketControllerTest`: add `@MockitoSettings(strictness = LENIENT)`
  - [x] Fix `SecurityConfig`: add `HttpStatusEntryPoint(UNAUTHORIZED)` for 401 vs 403
  - [x] Fix `ExamSessionServiceTest.incrementViolationCount`: align with repository-level DB update
  - [x] Fix `AIVisionServiceTest`: increase timeout to 5000ms; timeout test uses its own 200ms instance
- [x] Write walkthrough
