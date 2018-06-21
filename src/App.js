import React, { Component } from 'react';
import firebase from 'firebase';
import { FirebaseAuth } from 'react-firebaseui';
import ENV from './env';

import Messages from './components/Messages';
import Form from './components/Form';

import './App.css';

const config = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_API_KEY,
  databaseURL: ENV.FIREBASE_DATABASE_URL,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
};

firebase.initializeApp(config);

class App extends Component {
  state = {
    signedIn: false, // Local signed-in state.
  };
  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/signedIn',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccess: d => {
        console.log(d);
        this.setState({ signedIn: true });
        return false; // Avoid redirects after sign-in.
      },
    },
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img className="App-logo" src="http://futupolis.com/assets/robot.png" />
          <h1 className="App-title">Futupolis Admin</h1>
        </header>

        <div className="App-content">
          <Form />
          <br />
          <br />
          <br />
          <br />
          <Messages />
        </div>
      </div>
    );
  }
}

export default App;
