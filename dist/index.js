module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(87);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(379);
const github = __webpack_require__(538);
const fetch = __webpack_require__(124);
const cloneDeep = __webpack_require__(676);
const has = __webpack_require__(652);

const sendEvent = __webpack_require__(879).sendEvent;
const constructBody = __webpack_require__(879).constructBody;

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


/***/ }),

/***/ 124:
/***/ (function(module) {

module.exports = eval("require")("node-fetch");


/***/ }),

/***/ 379:
/***/ (function(module) {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 538:
/***/ (function(module) {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 652:
/***/ (function(module) {

module.exports = eval("require")("lodash.has");


/***/ }),

/***/ 676:
/***/ (function(module) {

module.exports = eval("require")("lodash.clonedeep");


/***/ }),

/***/ 879:
/***/ (function(module, __unusedexports, __webpack_require__) {

const cloneDeep = __webpack_require__(676);
const has = __webpack_require__(652);

// PR events are caught and translated into change events, when applicable. 
// Other events passthrough.
// TODO1: Capture deployment events (see "GitHub deployment events")
// TODO2: Capture other events in the Lifecycle Catalog
const extractBody = (team_id,github) => {

  // Treat PR opened against master as Change Initiated
  if (github.context.eventName === "pull_request" &&
      github.context.payload.pull_request.base.ref === "master" && 
      github.context.payload.action === "opened") {
    return ({
      stage: "Change",
      status: "Initiated",
      change_id: github.context.payload.pull_request.head.ref,
      team_id,
      custom: github
    });
  }

  // Treat PR merged to master as Change Succeeded
  if (github.context.eventName === "pull_request" &&
      github.context.payload.pull_request.base.ref === "master" && 
      github.context.payload.action === "closed") {
    return ({
      stage: "Change",
      status: "Succeeded",
      change_id: github.context.payload.pull_request.head.ref,
      team_id,
      custom: github
    });
  }

  // look through a bunch of options that can be used as change_id, if they exist
  let change_id = "";

  if (has(github, ["context","ref"])) {
    change_id = github.context.ref;
  }

  if (has(github, ["context","payload","pull_request","head","ref"])) {
    change_id = github.context.payload.pull_request.head.ref;
  }

  // Store data for events that haven't already matched
  return ({
    stage: github.context.eventName,
    status: github.context.payload.action,
    change_id,
    team_id,
    custom: github
  });
};
module.exports.extractBody = extractBody;

const constructBody = ( change_id,
                        custom,
                        github,
                        pipeline_id,
                        stage,
                        status,
                        team_id ) => {
  if (change_id || custom || pipeline_id || stage || status) {
    return ({
      change_id,
      custom,
      pipeline_id,
      stage,
      status,
      team_id
    });
  } else {
    return extractBody(team_id, cloneDeep(github));
  }
};
module.exports.constructBody = constructBody;

// This is not meant to be generic across request functions. reqFn is tightly
// coupled to the fetch signature, but injecting it makes it easy to test. 
const sendEvent = (body, token, url, reqFn) => {
  const opts = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
  return (reqFn(url, opts)
    .then(res => {
      if (res.status >= 400) {
        return ({"HTTPErrorStatus":res.status, "HTTPErrorStatusText":res.statusText});
      } else {
        return res.json();
      }
    })
  );
};
module.exports.sendEvent = sendEvent;


/***/ })

/******/ });