import React from 'react';
import { render } from 'react-dom';
import BaselineAnnouncement from '../dist/BaselineAnnouncement.js';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>react-md-icon</h1>
        <BaselineAnnouncement style={{ fontSize: '10em', color: 'purple' }} />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
