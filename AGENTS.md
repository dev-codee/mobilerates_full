# Mobile Rates

This repository owns mobilerates.info. Frontend and backend are independent copies of the Zozo source; changes here must not be pushed to either Zozo repository.

- Frontend: `frontend/` (Next.js). Before changing Next.js code, read the relevant guide in `frontend/node_modules/next/dist/docs/`. This version has breaking API and convention changes.
- Backend: `backend/` (Express and MongoDB).
- Deployment: `docker-compose.yml`, project `mobilerates`, containers `mobilerates-frontend` and `mobilerates-backend`, loopback ports 3002 and 5002.
- Never stop, recreate, prune, or modify containers belonging to other projects.
- Keep real environment files and credentials out of Git. Use `.env.example` for configuration documentation.
- Repository separation does not imply database separation. Never migrate, seed, delete, or copy production data without explicit authorization.
