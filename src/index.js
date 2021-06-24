// @ts-check
import ReactDOM from 'react-dom';
import Rollbar from 'rollbar';
import init from './init.jsx';

// не используется проверка на NODE_ENV т.к. Rollbar access token существует только в production
const rollbar = new Rollbar();
rollbar.configure({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: 'production',
  },
});

const render = async () => {
  const dom = await init();

  ReactDOM.render(dom, document.getElementById('chat'));
};

render();
