importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseApp = firebase.initializeApp({
  projectId: "gen-lang-client-0020131327",
  appId: "1:648115493865:web:79844855523409a14fc978",
  apiKey: "AIzaSyD2Xg6Jk4Se2RLPiuhTncY3VaQzf0gnQDg",
  authDomain: "gen-lang-client-0020131327.firebaseapp.com",
  storageBucket: "gen-lang-client-0020131327.firebasestorage.app",
  messagingSenderId: "648115493865",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
