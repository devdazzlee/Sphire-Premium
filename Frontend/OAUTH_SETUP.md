# Firebase OAuth Setup Guide

This guide will help you set up Google and Facebook OAuth login using Firebase Authentication.

## Why Firebase?

Firebase Authentication provides a simple, secure way to implement OAuth without managing OAuth flows manually. It handles all the complexity of Google and Facebook authentication.

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter project name: "Sphire Premium"
4. (Optional) Enable Google Analytics
5. Click "Create project"

### Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (`</>`)
2. Register your app:
   - App nickname: "Sphire Premium Web"
   - (Optional) Check "Also set up Firebase Hosting"
3. Click "Register app"
4. **Copy the Firebase configuration** - You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### Step 3: Enable Authentication Providers

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. **Enable Google:**
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"
3. **Enable Facebook:**
   - Click on "Facebook"
   - Toggle "Enable"
   - You'll need Facebook App ID and App Secret (see below)
   - Click "Save"

### Step 4: Get Facebook App Credentials (for Firebase)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create or select an app
3. Go to **Settings** > **Basic**
4. Copy **App ID** and **App Secret**
5. Add these to Firebase Facebook provider settings

### Step 5: Add Environment Variables

Create `Frontend/.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 6: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (e.g., `yourdomain.com`)

## Installation

Run this command in the Frontend directory:

```bash
npm install firebase
```

## Testing

1. Restart your development server
2. Go to `/login` page
3. Click "Google" or "Facebook" buttons
4. Complete the OAuth flow
5. You should be logged in!

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Firebase Authorized domains
- Go to Authentication > Settings > Authorized domains

### "Firebase: Error (auth/popup-blocked)"
- Allow popups in your browser
- Try clicking the button again

### Buttons Not Working
- Check browser console for errors
- Verify all Firebase environment variables are set
- Make sure you've restarted the dev server after adding env variables

---

## Old OAuth Setup (Direct Implementation)

If you prefer the direct OAuth implementation instead of Firebase, see the sections below. However, Firebase is recommended as it's simpler and more secure.

## Google OAuth Setup (Direct)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Sphire Premium")
5. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "Sphire Premium"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Click "Save and Continue"
   - Add test users (optional for development)
   - Click "Save and Continue"
   - Review and go back to dashboard

4. Now create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Sphire Premium Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click "Create"

5. **Copy the Client ID** - This is your `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Step 4: Add to Environment Variables

Create a file named `.env.local` in the `Frontend` folder and add:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-copied-client-id-here
```

---

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Choose "Consumer" as the app type
4. Fill in:
   - App Display Name: "Sphire Premium"
   - App Contact Email: Your email
5. Click "Create App"

### Step 2: Add Facebook Login Product

1. In your app dashboard, find "Add a Product"
2. Click "Set Up" on "Facebook Login"
3. Choose "Web" platform
4. Enter your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
5. Click "Save"

### Step 3: Configure Facebook Login Settings

1. Go to "Settings" > "Basic"
2. Note your **App ID** - This is your `NEXT_PUBLIC_FACEBOOK_APP_ID`
3. Add "App Domains":
   - `localhost` (for development)
   - `yourdomain.com` (for production)
4. Add "Website" site URL:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

### Step 4: Configure Valid OAuth Redirect URIs

1. Go to "Facebook Login" > "Settings"
2. Add "Valid OAuth Redirect URIs":
   - `http://localhost:3000/auth/facebook/callback` (for development)
   - `https://yourdomain.com/auth/facebook/callback` (for production)
3. Click "Save Changes"

### Step 5: Add to Environment Variables

Add to your `.env.local` file:

```
NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id-here
```

---

## Complete .env.local File

Create `Frontend/.env.local` with both credentials:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

## Important Notes

1. **Never commit `.env.local` to Git** - It's already in `.gitignore`
2. **Restart your development server** after adding environment variables
3. **For production**, add these same variables to your hosting platform's environment settings
4. **Development vs Production**: You'll need separate credentials or configure both URLs in the OAuth settings

## Testing

After adding the credentials:

1. Stop your Next.js dev server (Ctrl+C)
2. Start it again: `npm run dev` or `yarn dev`
3. Go to `/login` page
4. The Google and Facebook buttons should now work!

## Troubleshooting

### Google Button Not Showing
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Make sure you've restarted the dev server
- Check that authorized JavaScript origins include your current URL

### Facebook Button Not Working
- Check browser console for errors
- Verify `NEXT_PUBLIC_FACEBOOK_APP_ID` is set correctly
- Make sure you've restarted the dev server
- Check Facebook App settings for correct redirect URIs
- Make sure your app is not in "Development Mode" restrictions (or add yourself as a test user)

### Common Errors

**"Invalid client"**: Check that your Client ID/App ID is correct
**"Redirect URI mismatch"**: Add your current URL to authorized redirect URIs
**"App not active"**: Make sure your Facebook app is not in restricted mode

