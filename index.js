//
// This file is the entrypoint for the GitHub Action. Note that due to the way
// GitHub Actions work, the built program ('npm run build') has to be checked
// in to the GitHub repo ('dist/index.js').
//
//    DEVELOPMENT USAGE
//
// 1. set CTOAI_EVENTS_API_TOKEN in your environment:
//  export CTOAI_EVENTS_API_TOKEN=xyz
//
// 2. run the npm scripts provided:
//  cd action
//  npm install
//    - populate node_modules folder
//  npm run build
//    - builds dist/index.js (this must be committed to the GitHub repo)
//  npm run test
//    - runs unit tests
//  npm run dev
//    - will make a live API call to CTOAI_EVENTS_API_URL or the prd API URL
//  npm run prd
//    - this should fail when run locally, as opposed to when run as a GitHub Action
//
// 3. when updating this program, remember to build and commit 'dist/index.js'
//  npm run build
//  git add dist/index.js
//  git commit -m "new build"
//  git push origin ...
//

const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const cloneDeep = require('lodash.clonedeep');

const sendEvent = require('./action.js').sendEvent;
const constructBody = require('./action.js').constructBody;

// prd URL needs to be available in plaintext in the Action, so the public can use it.
const CTOAI_EVENTS_API_URL = (process.env.CTOAI_EVENTS_API_URL ? process.env.CTOAI_EVENTS_API_URL : "https://api.cto.sh/api/v1/events");

// Used for development only. Token is passed as a GitHub Secret by GitHub Actions.
const CTOAI_ACTION_ENVIRONMENT = process.env.CTOAI_ACTION_ENVIRONMENT;
const CTOAI_EVENTS_API_TOKEN = process.env.CTOAI_EVENTS_API_TOKEN;

try {

  const env = CTOAI_ACTION_ENVIRONMENT ? CTOAI_ACTION_ENVIRONMENT : 'prd';
  console.log("env", env);

  // This is the input provided to the Action by GitHub Action. The dev env is
  // for running the program locally, but using the live API, and using fixture
  // data instead of real data.
  const envs = {
    //
    // These are for running locally ('npm run dev') using test data (no GitHub).
    //
    "dev": {
      team_id : "team-id-123",
      token : CTOAI_EVENTS_API_TOKEN,
      change_id : "change-id-abc123",
      custom : "{\"s\":[1,2,3],\"g\":4}",
      pipeline_id : "pipeline-id-hijk",
      stage : "test-stage-A",
      status : "test-status-B"
    },
    //
    // These params come from the calling GitHub Action Workflow.
    //
    "prd": {
      team_id : core.getInput('team_id'),
      token : core.getInput('token'),
      change_id : core.getInput('change_id'),
      custom : core.getInput('custom'),
      pipeline_id : core.getInput('pipeline_id'),
      stage : core.getInput('stage'),
      status : core.getInput('status')
    }
  };

  ({
    // Mandatory params
    token,
    team_id,
    // Optional params
    change_id,
    custom,
    pipeline_id,
    stage,
    status
  } = envs[env]);

  if (!token && env === 'prd') {
    const err = "Please set your CTOAI_EVENTS_API_TOKEN in your GitHub secrets."
    core.setFailed(err);
    return 1;
  } else if (!token) {
    const err = "Please set your CTOAI_EVENTS_API_TOKEN environment variable.";
    console.error(err);
    return 1;
  }

  // We will still send the event when team_id is not provided for debugging
  // purposes.
  if (!team_id && env === 'prd') {
    console.error("Please set your CTOAI_TEAM_ID in your GitHub secrets.");
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
    .then(x => console.log("API Response:\n",x));

} catch (error) {
  // signals a failure that GitHub Actions will use to fail the workflow step.
  core.setFailed(error.message);
}
