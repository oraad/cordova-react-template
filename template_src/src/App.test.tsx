import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CordovaProvider } from './Cordova';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <CordovaProvider>
      <App />
    </CordovaProvider>
    , div);
  ReactDOM.unmountComponentAtNode(div);
});
