import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useCordova } from './Cordova';

const App: React.FC = () => {
  const cordova = useCordova()
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div id="deviceready" className="blink">
          <p className="event listening" hidden={cordova.isDeviceReady}>Connecting to Device</p>
          <p className="event received" hidden={!cordova.isDeviceReady}>Device is Ready</p>
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
