# JEEVANLINK — Real-time Blood Donor Network

A Spring Boot microservices platform that matches **hospitals** to nearby compatible
**blood donors** in real time, using a **Gemini-powered AI matcher** for ranking and an
**eligibility chatbot** for donor questions.

```
blood-donor-application/
├── backend/        ← Spring Boot multi-module Maven project (9 modules)
├── frontend/       ← React 18 + Vite + Tailwind 3
└── scripts/        ← One-off SQL + PowerShell seed helpers
```

---

## Stack

| Layer       | Tech                                                                 |
| ----------- | -------------------------------------------------------------------- |
| Backend     | Java 17, Spring Boot 3.2.5, Spring Cloud 2023.0.1, PostgreSQL 16     |
| Service mesh| Eureka (8761), Config Server (8888), Spring Cloud Gateway (8080)     |
| Auth        | JWT (HS256, 24h) via `jjwt 0.12.5`, BCrypt password hashing          |
| Persistence | Spring Data JPA + Flyway migrations                                  |
| AI          | Google Gemini (`gemini-pro`) via REST — used in `ai-matcher-service` |
| Frontend    | React 18, Vite 5, Tailwind 3, React Router 6, Axios, react-hot-toast |

---

## Backend services

| # | Module                        | Port | Purpose                                       |
| - | ----------------------------- | ---- | --------------------------------------------- |
| 1 | `service-registry` (Eureka)   | 8761 | Service discovery                             |
| 2 | `config-server`               | 8888 | Centralised config (native `config-repo/`)    |
| 3 | `api-gateway`                 | 8080 | Routing, CORS, JWT validation, header inject  |
| 4 | `user-service`                | 8081 | Register/login, JWT issuance, user profile    |
| 5 | `donor-service`               | 8082 | Donor profile, eligibility, donation history  |
| 6 | `hospital-service`            | 8083 | Hospital profile, 8-cell blood inventory      |
| 7 | `request-service`     ⭐      | 8084 | Blood requests + donor matching workflow      |
| 8 | `ai-matcher-service`  ⭐      | 8085 | Gemini matcher + eligibility chatbot          |
| 9 | `notification-service`        | 8086 | Email (SMTP) + in-app inbox                   |

---

## Quick start

### 1. Prerequisites

- **Java 17+** (`java -version`)
- **Maven 3.9+** (`mvn -v`)
- **PostgreSQL 16** running on `localhost:5432` with user `postgres` / pass `postgres`
- **Node 18+** + **npm** (for the frontend)
- *(Optional)* a [Google Gemini API key](https://aistudio.google.com/app/apikey) — without one,
  AI calls fall back to canned responses so the app still works.

### 2. Create the databases (one-time)

```bash
psql -U postgres -f scripts/create-databases.sql
```

This creates 6 empty databases (`jeevanlink_users`, `..._donors`, `..._hospitals`,
`..._requests`, `..._ai`, `..._notifications`). Flyway runs `V1__init.sql` on first boot.

### 3. Build the backend

```bash
cd backend
mvn clean install -DskipTests
```

### 4. Start the services (in order)

Each in its own terminal:

```bash
# 1. Eureka
cd backend/infrastructure/service-registry && mvn spring-boot:run

# 2. Config server
cd backend/infrastructure/config-server && mvn spring-boot:run

# 3. Gateway
cd backend/infrastructure/api-gateway && mvn spring-boot:run

# 4-9. The 6 services (any order)
cd backend/services/user-service          && mvn spring-boot:run
cd backend/services/donor-service         && mvn spring-boot:run
cd backend/services/hospital-service      && mvn spring-boot:run
cd backend/services/request-service       && mvn spring-boot:run
cd backend/services/ai-matcher-service    && mvn spring-boot:run
cd backend/services/notification-service  && mvn spring-boot:run
```

Open [http://localhost:8761](http://localhost:8761) — all 7 client services should be
registered (gateway + 6 microservices).

### 5. Seed demo data

```powershell
.\scripts\seed-data.ps1
```

This creates 1 hospital + 3 donors + 1 urgent O- demo request via the live API
(bypasses the bcrypt-hashing chicken-and-egg of a raw SQL seed).

### 6. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable        | Default                                        | Used by                       |
| --------------- | ---------------------------------------------- | ----------------------------- |
| `JWT_SECRET`    | `jeevanlink-super-secret-key-…` (32+ chars)    | `user-service`, `api-gateway` |
| `DB_USER`       | `postgres`                                     | all services                  |
| `DB_PASS`       | `postgres`                                     | all services                  |
| `GEMINI_API_KEY`| *(empty — falls back to canned responses)*     | `ai-matcher-service`          |
| `GEMINI_MODEL`  | `gemini-pro`                                   | `ai-matcher-service`          |
| `SMTP_HOST`     | `smtp.gmail.com`                               | `notification-service`        |
| `SMTP_USER`     | *(empty — logs to console instead of sending)* | `notification-service`        |
| `SMTP_PASS`     | *(empty)*                                      | `notification-service`        |

Set on Windows PowerShell:
```powershell
$env:GEMINI_API_KEY = 'your-gemini-key-here'
```
…then start `ai-matcher-service`. AI reasoning will appear on each donor match and
the eligibility chatbot will use Gemini.

---

## Demo logins (after running the seed script)

| Role          | Email                       | Password   | Blood group |
| ------------- | --------------------------- | ---------- | ----------- |
| HOSPITAL_ADMIN| `hospital1@jeevanlink.com`  | `hosp123`  | —           |
| DONOR         | `donor1@jeevanlink.com`     | `donor123` | O+          |
| DONOR         | `donor2@jeevanlink.com`     | `donor123` | A-          |
| DONOR         | `donor3@jeevanlink.com`     | `donor123` | O- (universal) |

---

## API surface (via gateway)

| Method | Path                                 | Auth | Service              |
| ------ | ------------------------------------ | ---- | -------------------- |
| POST   | `/api/auth/register`                 | —    | user-service         |
| POST   | `/api/auth/login`                    | —    | user-service         |
| GET    | `/api/users/me`                      | ✅   | user-service         |
| POST   | `/api/donors`                        | ✅   | donor-service        |
| GET    | `/api/donors/me`                     | ✅   | donor-service        |
| PATCH  | `/api/donors/me/availability`        | ✅   | donor-service        |
| POST   | `/api/hospitals`                     | ✅   | hospital-service     |
| GET    | `/api/inventory/me`                  | ✅   | hospital-service     |
| POST   | `/api/inventory`                     | ✅   | hospital-service     |
| PATCH  | `/api/inventory/{id}/add\|use`       | ✅   | hospital-service     |
| POST   | `/api/requests`                      | ✅   | request-service ⭐   |
| GET    | `/api/requests/{id}`                 | ✅   | request-service      |
| PATCH  | `/api/requests/match/{id}/accept`    | ✅   | request-service      |
| PATCH  | `/api/requests/match/{id}/decline`   | ✅   | request-service      |
| PATCH  | `/api/requests/{id}/fulfill`         | ✅   | request-service      |
| POST   | `/api/ai/chatbot`                    | ✅   | ai-matcher-service ⭐|
| POST   | `/api/ai/eligibility-check`          | ✅   | ai-matcher-service   |
| GET    | `/api/notifications`                 | ✅   | notification-service |

Every service exposes Swagger UI at `/swagger-ui.html` on its own port (e.g.
`http://localhost:8081/swagger-ui.html` for user-service).

---

## How the AI matching works

When a hospital creates a blood request, `request-service` calls
`ai-matcher-service:/api/matcher/find`, which:

1. **Filters** donors via Feign call to `donor-service`:
   - Only blood groups compatible with the recipient (full ABO/Rh matrix)
   - `available = true`
   - 18 ≤ age ≤ 65, last donation > 90 days ago
2. **Scores** each donor with a Haversine-distance proximity weight (0.7) +
   recency weight (0.3) — output between 0 and 1.
3. **Ranks** the top 5 by score.
4. **Asks Gemini** to write a one-sentence reasoning for each — falls back to
   a deterministic template if the key isn't set.
5. Returns `[{donorId, matchScore, distanceKm, reasoning}, …]` which
   `request-service` persists as `donor_matches`.

---

## Notes / known shortcuts

- **No JWT validation inside the services** — only the gateway validates the
  token, then injects `X-User-Id` + `X-User-Role` headers that controllers trust.
  Suitable for a coursework / demo; behind a public network you would also
  re-verify at the service boundary.
- **Feign passes JSON-serialised enums.** Each service has its own `BloodGroup`
  copy because cross-module-dependency adds build complexity for no demo
  benefit; the wire format is identical.
- **Email is opt-in.** When `SMTP_USER` is empty, notifications are saved to
  the in-app inbox and logged to the console instead of being emailed.
- **Docker / Kubernetes deployment is intentionally not included** — the
  project is shaped to be added later without restructure.
also im gettin the pom xml erros her and there in the backend fix that in the services folder 