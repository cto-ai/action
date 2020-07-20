const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const cloneDeep = require('lodash.clonedeep');
const has = require('lodash.has');

const sendEvent = require('./agent.js').sendEvent;
const constructBody = require('./agent.js').constructBody;

// PRD URL needs to be available in plaintext in the Action, so the public can use it.
const CTOAI_EVENTS_API_URL = (process.env.CTOAI_EVENTS_API_URL ? process.env.CTOAI_EVENTS_API_URL : "https://api.cto.sh/api/v1/events");

// Used for development
const CTOAI_ACTION_ENVIRONMENT = process.env.CTOAI_ACTION_ENVIRONMENT;
const CTOAI_EVENTS_API_TOKEN = process.env.CTOAI_EVENTS_API_TOKEN;

try {

  let team_id;
  let token;
  let change_id;
  let custom;
  let pipeline_id;
  let stage;
  let status;

  // This lets us develop locally against the live API
  if (CTOAI_ACTION_ENVIRONMENT === "dev") {
    console.log('env: dev');
    team_id = "team-id-123";
    token = CTOAI_EVENTS_API_TOKEN;
    change_id = "change-id-abc123";
    custom = "{\"s\":[1,2,3],\"g\":4}";
    pipeline_id = "pipeline-id-hijk";
    stage = "test-stage-A";
    status = "test-status-B";
  } else {
    console.log('env: prd');

    //
    // The following parameters come from the calling GitHub Action Workflow.
    //

    // Mandatory params (If they are not provided, failure is silent by design)
    team_id = core.getInput('team_id');
    token = core.getInput('token');

    // Optional params
    change_id = core.getInput('change_id');
    custom = core.getInput('custom');
    pipeline_id = core.getInput('pipeline_id');
    stage = core.getInput('stage');
    status = core.getInput('status');
  }

  const body = constructBody(
    change_id,
    cloneDeep(custom),
    cloneDeep(github),
    pipeline_id,
    stage,
    status,
    team_id
  );

  sendEvent(body, token, CTOAI_EVENTS_API_URL, fetch)
    .then(x => console.log(x));

} catch (error) {
  core.setFailed(error.message);
}
