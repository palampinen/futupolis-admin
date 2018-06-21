import React, { Component, Fragment } from 'react';
import firebase from 'firebase';
import { map, isEmpty, isObject } from 'lodash';
import ENV from '../../env';

import './Form.css';

const queryParametrize = (url, query) => {
  let queryParametrizedUrl = url;

  if (isObject(query) && !isEmpty(query)) {
    queryParametrizedUrl +=
      '?' +
      Object.keys(query)
        .filter(k => !isEmpty(query[k]))
        .map(k => {
          return encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
        })
        .join('&');
  }

  return queryParametrizedUrl;
};



class App extends Component {
  state = {
    title: '',
    message: '',
    picture: null,
    sendOK: false,
    sending: false,
  };
  constructor(props) {
    super(props);

    this.sendMessage = this.sendMessage.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.flashSuccess = this.flashSuccess.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentDidMount() {
    this.clearForm();
  }

  sendMessage() {
    const { title, message, picture, sending } = this.state;

    if (!title || !message || sending) {
      return;
    }

    this.setState({ sending: true });

    // # Image upload promise
    let imageUploadPromise = Promise.resolve();
    if (picture) {
      const storageRef = firebase.storage().ref();
      const pictureRef = storageRef.child(
        `images/futupolis-notification-${new Date().getTime()}.jpg`
      );

      imageUploadPromise = pictureRef.put(picture);
    }

    // # Base of Notification
    const postData = {
      title: this.state.title,
      message: this.state.message,
    };

    // # Start Action
    // Maybe upload image
    imageUploadPromise.then((snapshot = {}) => {
      const { downloadURL } = snapshot;
      // Add image data to Notification
      if (downloadURL && picture) {
        postData.picture = downloadURL;
      }

      const baseUrl = `https://cors-anywhere.herokuapp.com/${ENV.FUNCTIONS_URL}`;
      const functionUrl = queryParametrize(`${baseUrl}/createNotificationItem`, postData);

      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('FUNCTION_SECRET_KEY', ENV.FUNCTION_SECRET_KEY);

      return fetch(functionUrl, {
        method: 'GET',
        headers: myHeaders,
      }).then(() => {
        this.flashSuccess();
        this.clearForm();
      })
    });
  }

  updateForm(field, value) {
    this.setState({ [field]: value });
  }

  handleUpload(files) {
    const file = files[0];
    this.setState({ picture: file });
  }

  clearForm() {
    this.setState({ title: '', message: '', picture: null });
  }

  flashSuccess() {
    this.setState({ sendOK: true });
    this.setState({ sending: false });

    setTimeout(() => {
      this.setState({ sendOK: false });
    }, 4000);
  }

  render() {
    const { title, message, sendOK, sending } = this.state;
    return (
      <Fragment>
        <h1>Add Message to Futupolis App</h1>
        <div className="form">
          <label>
            <span className="label">
              Upload image (optional)
              <span className="help-text">Resize image before upload (~1000px max width)</span>
            </span>
            {!sendOK ?
              <input
                type="file"
                className="form-control"
                placeholder="Upload image"
                onChange={e => this.handleUpload(e.target.files)}
              />
              :
              <div className="form-control placeholder-form-element">Image Upload</div>
            }
          </label>

          <label>
            <span className="label">
              Title *
              <span className="help-text">Max 3-4 words. If you want to use emojis copy-paste <a href="https://getemoji.com/" target="_blank">from here</a></span>
            </span>
            <input
              required
              type="text"
              className="form-control"
              placeholder="Title for message"
              value={title}
              onChange={e => this.updateForm('title', e.target.value)}
            />
          </label>

          <label>
            <span className="label">
              Message *
              <span className="help-text">Message can contain line changes and links.</span>
            </span>
            <textarea
              required
              value={message}
              className="form-control"
              placeholder="Write message to App users..."
              onChange={e => this.updateForm('message', e.target.value)}
            />
          </label>

          <button onClick={this.sendMessage} className="button">
            {sending && <span style={{ color: '#FD5404' }}>Sending...</span>}
            {!sendOK && !sending && <span>Send Message</span>}
            {sendOK && <span>✅ Sent</span>}
          </button>
        </div>
      </Fragment>
    );
  }
}

export default App;
