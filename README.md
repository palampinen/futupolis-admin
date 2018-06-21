# Futupolis Admin

Simple application for creating notification items for [Futupolis Application](https://github.com/palampinen/futupolis-app).

## Firebase functions

[Firebase functions](https://firebase.google.com/docs/functions/) are used for:

- Saving pushTokens from Mobile App
- Writing _notifications_ to Firebase Database safely
- Listening _notifications_ creating to Database and sending push notifications based on these events

## Set up firebase

1.  Create new [Firebase application](https://console.firebase.google.com/)
2.  Enable database with following rules:

```
{
  "rules": {
    "notifications": {
      ".read": true,
      ".write": false
    },
    "pushTokens": {
      ".read": false,
      ".write": true
    }
  }
}
```

3.  Enable Storage with rules:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write;
    }
  }
}
```

4.  Setup firebase CLI [firebase cli](https://firebase.google.com/docs/cli/)
5.  Upload functions to firebase by running `firebase deploy --only functions`
6.  Add firebase function base url to env.js `FUNCTIONS_URL`, can be found from Firebase console > Functions
7.  Add firebase configuration to web app env.js starting with `FIREBASE_`
8.  Add firebase env configuration secret: `firebase functions:config:set functions.secret="YOUR SECRET"` and add same secret to application env.js `FUNCTION_SECRET_KEY`

## React Application

Application to add notifications to Firebase Database. Notifications include:

- _picture_ that will be uploaded to [Firebase Storage](https://firebase.google.com/docs/storage/)
- _title_ and _message_ which will be content of push notification and notification in the App news feed

# Start App

`npm install`

`cp env.example.js env.js` And fill Firebase configuration

`npm start`

# Licence

MIT
