const debug = require('debug')('action');
const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const cloneDeep = require('lodash.clonedeep');
const has = require('lodash.has');
const get = require('lodash.get');
const startCase = require('lodash.startcase');
const camelCase =  require('lodash.camelcase');


if(!core.getInput('team_id')) {
  return core.setFailed("Please set CTOAI_TEAM_ID in your Github Actions Secrets.")
}

if(!core.getInput('token')) {
  return core.setFailed("Please set CTOAI_EVENTS_API_TOKEN in your Github Actions Secrets.")
}

const CTOAI_EVENTS_API_URL = core.getInput('url') || 'https://api.cto.sh/api/v1/events'
const CTOAI_EVENTS_API_TOKEN = core.getInput('token');
const CTOAI_EVENTS_TEAM_ID = core.getInput('team_id');

try {

  let body = mapEventsByRepo(github)

  sendEvent(body)
    .then(res => res.json())
    .then(output => console.log('API Response:', output))
    .catch((err) => {
      core.setFailed(err)
    })

} catch (err) {
  // signals a failure that GitHub Actions will use to fail the workflow step.
  core.setFailed(err.message);
}

function mapEventsByRepo(github) {

  // console.log('API URL:', CTOAI_EVENTS_API_URL)
  // console.log('team_id', CTOAI_EVENTS_TEAM_ID);
  // console.log('pipeline_id:', process.env.GITHUB_REPOSITORY)
  // console.log('stage:', snakeToTitleCase(get(github, ['context', 'eventName'])))
  // console.log('status:', snakeToTitleCase(get(github, ['context', 'payload', 'action'])) || 'Success')
  // console.log('change_id:', github.context.sha)
  // console.log('stage_ref:', process.env.GITHUB_REF.replace('refs/heads/',''))
  // console.log(process.env);

  return {
    'team_id': `${CTOAI_EVENTS_TEAM_ID}`,
    'pipeline_id': `${process.env.GITHUB_REPOSITORY}`,
    'stage': `${snakeToTitleCase(get(github, ['context', 'eventName']))}`,
    'status': `${snakeToTitleCase(get(github, ['context', 'payload', 'action'])) || 'Success'}`,
    'change_id': `${github.context.sha}`,
    'stage_ref': `${process.env.GITHUB_REF.replace('refs/heads/','')}`
  }
}

function sendEvent(body) {
  const opts = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CTOAI_EVENTS_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  console.log(`Sending Metrics to ${CTOAI_EVENTS_API_URL}`, opts)
  return fetch(CTOAI_EVENTS_API_URL, opts)
}

function snakeToTitleCase (snake_str) {
 return startCase(camelCase(snake_str)).replace(' ','');
}
