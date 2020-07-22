//
// This agent will read the user input and the GitHub context object to
// determine what metrics should be stored, and what values each stored metric
// should use for the various parameters.
//
//

const cloneDeep = require('lodash.clonedeep');
const has = require('lodash.has');

//
//  PURPOSE
//
// This function generates the best-effort payload for the Events API based
// entirely on the github context object. This is meant to be used when the
// user has not supplied any information.
//
// As of now, Pull Requests events are caught and translated into change
// events, when applicable. Other events are also stored, but are not
// transformed much.
//
//
//  INPUT
//
// team_id  string  supplied by CTO.ai to a member of the team.
// github   object  large object of metadata from GitHub Actions.
//
//
//  OUTPUT
//
// The function outputs a JavaScript object to use for the body of the HTTP API
// request, passed to the sendEvent function.
//
//
//  EXAMPLE
//
// const http_body = getBodyFromGitHubContext("aef3d53", {context:{}});
//
//
const getBodyFromGitHubContext = (team_id, github) => {

  //
  // TODO1: Capture deployment events (see "GitHub deployment events")
  // TODO2: Capture other events in the Lifecycle Catalog
  //
  //

  // Detect Change Initiated (Pull Request Opened against Master)
  if (

// is a pull request
has(github, ["context","eventName"]) && github.context.eventName === "pull_request" &&

// is against master
has(github, ["context","payload","pull_request","base","ref"]) && github.context.payload.pull_request.base.ref === "master" &&

// is opened
has(github, ["context","payload","action"]) && github.context.payload.action === "opened"

     ) {
    return ({
      stage: "Change",
      status: "Initiated",
      change_id: github.context.payload.pull_request.head.ref,
      team_id,
      custom: github
    });
  }

  // Detect Change Succeeded (Pull Request Closed against Master)
  if (has(github, ["context","eventName"]) &&
      github.context.eventName === "pull_request" &&

      has(github, ["context","payload","pull_request","base","ref"]) &&
      github.context.payload.pull_request.base.ref === "master" &&

      has(github, ["context","payload","action"]) &&
      github.context.payload.action === "closed") {
    return ({
      stage: "Change",
      status: "Succeeded",
      change_id: github.context.payload.pull_request.head.ref,
      team_id,
      custom: github
    });
  }

  // Find something that can be used as change_id (last is highest priority).
  let change_id = "";
  if (has(github, ["context","ref"])) {
    change_id = github.context.ref;
  }
  if (has(github, ["context","payload","pull_request","head","ref"])) {
    change_id = github.context.payload.pull_request.head.ref;
  }

  // Store data for events that haven't already matched
  return ({
    stage: has(github, ["context","eventName"]) ? github.context.eventName : undefined,
    status: has(github, ["context","payload","action"]) ? github.context.payload.action : undefined,
    change_id,
    team_id,
    custom: github
  });
};
module.exports.getBodyFromGitHubContext = getBodyFromGitHubContext;

//
// This function takes various input parameters that the GitHub Action has
// available to it and determines what kind of HTTP API body should be
// constructed. If the user has supplied any of a select list of parameters,
// then we don't fill in the object using GitHub context object information.
// If the user has supplied none of those key parameters, then we assume that
// the user wishes us to do a best-effort fill of the events body using all the
// information available in the GitHub context object.
//
const constructBody = ( change_id,
                        custom,
                        github,
                        pipeline_id,
                        stage,
                        status,
                        team_id ) => {
  //
  // The precense of any of these values below implies the user wants to specify
  // all of them. In which case, we won't use the GitHub Context object to
  // populate the event API body (we just return all existing values instead).
  //
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
    return getBodyFromGitHubContext(team_id, cloneDeep(github));
  }
};
module.exports.constructBody = constructBody;

//
//  PURPOSE
//
// This function sets the necessary parameters, calls the HTTP request
// function, and handles the output from the request function. reqFn should be
// the standard fetch function, or a function that implements fetch's
// interface.
//
//
//  INPUT
//
// body   object     sent as HTTP request body, after transformation to JSON.
// token  string     the API key supplied by CTO.ai to the user.
// url    string     the CTO.ai events API URL.
// reqFn  function   fetch, or a fetch standin
//
//
//  OUTPUT
//
// Outputs a promise that, when resolved, calls a function that has, as its
// first argument, an object containing either the HTTP response body or error
// information.
//
//
//  EXAMPLE
//
// sendEvent({a:1}, "xyz", "http://www.example.com/api", fetch)
//   .then(out => console.log(out));
//
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
