## Frontend Setup

This frontend runs on Next.js and talks directly to the FastAPI backend.

### 1) Configure backend URL

Copy `.env.example` to `.env.local` and update if needed:

```bash
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000
```

### 2) Start the frontend

```bash
npm run dev
```

The app runs on [http://localhost:8000](http://localhost:8000).

### 3) Backend requirement

The backend must be running and CORS should allow the frontend origin.  
You can set backend CORS with:

```bash
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```
