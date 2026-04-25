# API Configuration Guide

## How to Change the Backend URL

The frontend is configured to use a dynamic backend URL that can be easily changed without modifying code.

### Configuration Files

#### `.env.local` (Frontend)
Located in the root directory: `c:\Clients_App\eklavya-app\.env.local`

```
REACT_APP_API_URL=http://localhost:8000/api
```

### Development Environment (Default)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

**Usage:**
```bash
python run.py  # Starts both servers
```

### Production Environment

When deploying to production, update `.env.local`:

```env
REACT_APP_API_URL=https://your-production-domain.com/api
```

Then restart the React development server:

```bash
npm start
```

### How It Works

1. **config.js** - Reads from environment variables
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
   ```

2. **login.js** - Uses the configured URL
   ```javascript
   import API_URL from "./config";
   fetch(`${API_URL}/auth/login/`, ...)
   ```

3. **Dashboard.js** - Uses the configured URL
   ```javascript
   import API_URL from "./config";
   fetch(`${API_URL}/auth/profile/`, ...)
   ```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API base URL |

## Quick Switches

### Switch to Production
1. Edit `.env.local`:
   ```env
   REACT_APP_API_URL=https://your-api.com/api
   ```
2. Restart React server: `npm start`

### Switch Back to Development
1. Edit `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```
2. Restart React server: `npm start`

## Important Notes

- ✅ API URL is **centralized** in `src/config.js`
- ✅ All API calls use the **same configuration**
- ✅ Easy to **switch environments** without code changes
- ✅ `.env.local` is **NOT committed** to git (ignored)
- ✅ Example file `.env.example` is provided for reference

## Testing the Connection

After starting both servers:

1. **Open browser:** `http://localhost:3000`
2. **Login with:** `admin` / `admin`
3. **Check browser console** (F12) for any API errors
4. **If CORS error appears**, verify backend URL is correct and backend is running

