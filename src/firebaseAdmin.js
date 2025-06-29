const admin = require("firebase-admin");

// Replace with your Firebase service account key JSON file
const serviceAccount = require("./path-to-your-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
