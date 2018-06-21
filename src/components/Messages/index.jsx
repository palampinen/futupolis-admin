import React, { Component, Fragment } from 'react';
import firebase from 'firebase';
import { map, toArray, orderBy } from 'lodash';
import moment from 'moment';

import './Messages.css';

class App extends Component {
  state = {
    messages: [],
  };
  constructor(props) {
    super(props);

    this.fetchMessages = this.fetchMessages.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
  }

  componentDidMount() {
    this.fetchMessages();
  }

  fetchMessages() {
    var messages = firebase.database().ref('notifications');

    messages.on('value', snapshot => {
      const values = toArray(snapshot.val());
      const orderedValues = orderBy(values, 'timestamp').reverse();

      this.updateMessages(orderedValues);
    });
  }

  updateMessages(messages) {
    this.setState({ messages });
  }

  render() {
    const { messages } = this.state;
    return (
      <Fragment>
        <h1>Messages</h1>
        <div className="messages">
          {map(messages, msg => (
            <div className="message" key={`${msg.timestamp}:${msg.title}`}>
              <span className="message__date">
                {moment(msg.timestamp).format('ddd DD.MM. HH:mm')}
              </span>
              {msg.picture && <img src={msg.picture} className="message__image" />}
              <span className="message__title">{msg.title || '- no title -'}</span>
              <span className="message__text">{msg.message}</span>
            </div>
          ))}
        </div>
      </Fragment>
    );
  }
}

export default App;
