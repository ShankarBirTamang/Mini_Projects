# Firebase Setup Guide for Lottery App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "lottery-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "lottery-web")
6. Copy the firebaseConfig object

## Step 4: Update Firebase Configuration

1. Open `src/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};
```

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to "Firestore Database" > "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /channels/{channelId} {
      allow read, write: if true; // For development - change this for production
    }
  }
}
```

## Step 6: Test the Integration

1. Run your app: `npm run dev`
2. Create a channel
3. Join the channel from another browser tab
4. Select boxes and verify real-time updates

## Production Security Rules

For production, update the Firestore rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /channels/{channelId} {
      allow read: if true;
      allow write: if request.auth != null ||
                   (resource == null && request.resource.data.admin != null);
    }
  }
}
```

## Features Added

✅ Real-time channel updates
✅ Persistent data storage
✅ Multi-user synchronization
✅ Box selection with one-per-user limit
✅ Real-time drawing results
✅ Channel management (create, join, reset)

## Next Steps

- Add user authentication
- Implement user profiles
- Add channel deletion
- Add admin controls
- Implement real-time notifications
