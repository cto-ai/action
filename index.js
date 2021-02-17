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
const CTOAI_TEAM_ID = process.env.CTOAI_TEAM_ID;

try {

  const env = CTOAI_ACTION_ENVIRONMENT ? CTOAI_ACTION_ENVIRONMENT : 'prd';
  //console.log("env", env);

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
      event_name : "deployment",
      event_action : "succeeded",
      repo : "org-name/repo-name",
      environment: "production",
      branch : "main",
      commit : "cfb11968bb0afe4cad144133996d0da84697cd08",
      image : "6327219d0db0",
      meta : { user: "ci-user", origin: "github" }
    },
    //
    // These params come from the calling GitHub Action Workflow.
    //
    "prd": {
      team_id : CTOAI_TEAM_ID,
      token : CTOAI_EVENTS_API_TOKEN,
      event_name : core.getInput('event_name'),
      event_action : core.getInput('event_action'),
      repo : core.getInput('repo'),
      environment: core.getInput('environment'),
      branch : core.getInput('branch'),
      commit : core.getInput('commit'),
      image : core.getInput('image'),
      meta : {}
    }
  };


  ({
    // Mandatory params
    team_id,
    token,
    event_name,
    event_action,
    // Optional params
    repo,
    environment,
    branch,
    commit,
    image,
    meta
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
    github,
    team_id,
    event_name,
    event_action,
    repo,
    environment,
    branch,
    commit,
    image,
    meta
  );


  console.log('metric payload:')
  console.log(body);

  // sendEvent(body, token, CTOAI_EVENTS_API_URL, fetch)
    // .then(x => console.log("API Response:\n",x));

} catch (error) {
  // signals a failure that GitHub Actions will use to fail the workflow step.
  core.setFailed(error.message);
}
