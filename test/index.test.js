'use strict';

const { test } = require('tap');
const nock = require('nock');
const { run } = require('../src/run');

const TOKEN = 'jifeo2903u089jf3920';
const TEAM_ID = 'i992-j9f23j09-j092j0';

const setInput = (name, value) => {
  process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]=value;
}

const clearInput = (name) => {
  delete process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`];
}

test('Push event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN);
  setInput('team_id', TEAM_ID);
  setInput('event_name', 'deployment');
  setInput('event_action', 'succeeded');

  const context = {
    eventName: 'push',
    payload: {
      ref: 'refs/heads/main',
      after: '12345',
      repository: {
        full_name: 'org/test'
      }
    }
  };

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'main',
      commit: '12345',
      repo: 'org/test'
    })
    .reply(200, { message: 'event written', data: {} });

  await run(context);
  is(req.isDone(), true);

  clearInput('token');
  clearInput('team_id');
  clearInput('event_name');
  clearInput('event_action');
})
