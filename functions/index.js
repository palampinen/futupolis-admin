const _ = require('lodash');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//
// # Add pushToken for userId
exports.addPushTokenForUserId = functions.https.onRequest((req, res) => {
  const userId = req.query.userId;
  const pushToken = req.query.pushToken;

  if (_.isNil(userId) || _.isNil(pushToken)) {
    return res.sendStatus(401);
  }

  return admin
    .database()
    .ref('/pushTokens/' + userId)
    .set({ token: pushToken })
    .then(snapshot => {
      console.log('pushToken added for userId ' + userId);
      return res.sendStatus(200);
    });
});

//
// # Send push notifications for certain token or tokens
// token: <string> or <array> of strings
// payload: <object> notification: { body: <string>, title: <string> }
const sendMessageToDevices = (tokens, payload) =>
  admin
    .messaging()
    .sendToDevice(tokens, payload)
    .then(response => {
      console.log('Sent messages to', tokens);
      console.log('Successfully sent message:', response);
      const error = _.find(response.results, res => res.error);
      console.log('Possible error', error);

      return true;
    })
    .catch(error => {
      console.log('Error sending message:', error);
      return true;
    });

//
// # Trigger write @ /notifications
// --> send a push notification to all people who have saved the token
exports.sendPushMessage = functions.database
  .ref('notifications/{notificationId}')
  .onCreate((event, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const allData = event.val();
    const notificationId = context.params.notificationId;

    const title = allData.title;
    const message = allData.message;

    console.log('New Notification should be sent: ', { title, message });

    // Send per device
    return admin
      .database()
      .ref('/pushTokens')
      .once('value')
      .then(snapshot => {
        // /pushTokens is an object of this form:
        // {
        //   userIdX: { token: pushTokenString },
        //   userIdY: { token: pushTokenString },
        //   ...
        // }
        const userIdObjects = snapshot.val();

        if (_.isEmpty(userIdObjects)) {
          console.log('No pushTokens yet to send message to...');
          return false;
        }

        const pushTokens = _.map(userIdObjects, userIdObject => _.get(userIdObject, 'token'));

        // See the "Defining the message payload" section below for details
        // on how to define a message payload.
        // NOTE: the notification dictionary HAS TO BE HERE
        // read this: https://firebase.google.com/docs/cloud-messaging/concept-options#notifications
        const messagePayload = {
          notification: {
            title: title,
            body: message,
            messageId: notificationId,
          },
          data: {},
        };

        // Send a message to the devices
        return sendMessageToDevices(pushTokens, messagePayload);
      });
  });

exports.createNotificationItem = functions.https.onRequest((req, res) => {
  // # Validate secret
  if (req.get('FUNCTION_SECRET_KEY') !== functions.config().functions.secret) {
    return res.sendStatus(401);
  }

  // # Parse Data
  const { title, message, picture } = req.query;
  const timestamp = new Date().getTime();
  const data = { title, message, timestamp };

  // # Check required fields
  if (_.isNil(title) || _.isNil(message)) {
    return res.sendStatus(401);
  }

  // # Add picture
  if (picture) {
    data.picture = picture;
  }

  // # Write to Firebase DB
  return admin
    .database()
    .ref('/notifications/')
    .push(data)
    .then(snapshot => {
      console.log('notification added succesfully');
      return res.sendStatus(200);
    });
});
