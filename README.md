# Mobile Rates

Independent frontend and backend repository for **mobilerates.info**.

## Layout

- `frontend/`: Next.js application, public site and administration interface.
- `backend/`: Express API, MongoDB models and integrations.
- `docker-compose.yml`: production services scoped to Docker project `mobilerates`.
- `deploy.sh`: builds and updates only the two Mobilerates services.
- `build-frontend.sh`: builds only the Mobilerates frontend image.

This is a source snapshot, not Git submodules or linked working trees. Neither application has a Git remote pointing to Zozo. Future changes belong in `https://github.com/dev-codee/mobilerates_full.git`.

Initial source: frontend `7d6b419`, backend `9657348`, copied on 21 October 2026. The backend Docker ignore rules also preserve the existing Mobilerates deployment exclusions. Local assistant settings, build output, dependencies, and production secrets are excluded.

## Local development

Use Node.js 20 or newer and a MongoDB development database.

```sh
git clone https://github.com/dev-codee/mobilerates_full.git
cd mobilerates_full
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure the environment files. The frontend's Google OAuth client ID and backend's `GOOGLE_CLIENT_ID` should match. Use credentials and data appropriate for development.

In separate terminals:

```sh
cd backend
npm ci
npm run dev
```

```sh
cd frontend
npm ci
npm run dev
```

The frontend uses port 3000 and the API uses port 5000. Existing application README files contain inherited implementation notes; this root README defines the Mobilerates repository and deployment paths.

## Production

Server checkout: `/root/mobilerates_full`.

Real `frontend/.env` and `backend/.env` files are stored only on the server and are ignored by Git. Public Next.js settings are embedded during a production build; rebuild after changing them. Compose explicitly sets the production website/API URLs and reads `NEXT_PUBLIC_GOOGLE_CLIENT_ID` from `frontend/.env`.

```sh
cd /root/mobilerates_full
git pull --ff-only origin main
./deploy.sh
```

The deploy script uses only this checkout. It builds both images before replacing services and never runs global Docker operations.

Service mappings remain:

| Service | Container | Host binding |
| --- | --- | --- |
| Frontend | `mobilerates-frontend` | `127.0.0.1:3002` |
| Backend | `mobilerates-backend` | `127.0.0.1:5002` |

Nginx continues using `/etc/nginx/sites-available/mobilerates.info`, with the existing certificate under `/etc/letsencrypt/live/mobilerates.info/`. No Nginx changes are required for this repository split.

The old `/root/mobile-deployment/deploy.sh` and `build-frontend.sh` forward to this checkout for compatibility. The old source directories are retained as a backup and are no longer the source for these deployment commands. Existing containers are left running during repository migration; their Compose working-directory labels update on their next deployment.

Mobilerates and Zozo currently use the **same production MongoDB database**. This was verified during the repository split. Editing shared records through either site's administration interface can therefore affect both sites. The code repositories and deployment commands are separate; production data is still shared.

This split preserves the existing database and external-service configuration. It does not duplicate or migrate database records. A separate database or separate Cloudinary/OAuth accounts requires a separate migration plan.

## Checks

```sh
cd frontend && npm run test:currency
cd ../backend && npm run test:currency
```

For a frontend production build, run `npm run build` inside `frontend/` with the desired public environment configuration. On the server, validate Compose without replacing any containers:

```sh
docker compose --env-file frontend/.env config --quiet
```

The domain renewal/DNS outage is separate from this repository migration and must be resolved at the registrar.
