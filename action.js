//
// This agent will read the user input and the GitHub context object to
// determine what metrics should be stored, and what values each stored metric
// should use for the various parameters.
//
//

const cloneDeep = require('lodash.clonedeep');
const has = require('lodash.has');
const get = require('lodash.get');
const startCase = require('lodash.startcase');
const camelCase =  require('lodash.camelcase');

const snakeToTitleCase = (snake_str) => {
 return startCase(camelCase(snake_str)).replace(' ','');
}
module.exports.snakeToTitleCase = snakeToTitleCase;

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
const getBodyFromGitHubContext = (team_id, github) => {
  // TODO1: Capture deployment events (see "GitHub deployment events")
  // TODO2: Capture other events in the Lifecycle Catalog

  // Defines the named event in terms of a set of matching values embedded in
  // the github context object.
  const event_defs = [
    { ctoai_event:"Change Initiated",
      conditions: [
        [ ["context","eventName"], "pull_request" ],
        [ ["context","payload","pull_request","base","ref"], "master" ],
        [ ["context","payload","action"], "opened" ]
      ]
    },
    { ctoai_event:"Change Succeeded",
      conditions: [
        [ ["context","eventName"], "pull_request" ],
        [ ["context","payload","pull_request","base","ref"], "master" ],
        [ ["context","payload","action"], "closed" ]
      ]
    }
  ];

  // Defines the HTTP request body to be used by the event with the matching
  // name.
  const event_bodies = {
    "Change Initiated" : {
      stage: "Change",
      status: "Initiated",
      change_id: get(github, ["context","sha"]),
      pipeline_id: get(github, ["context","payload","pull_request","head","ref"]),
      stage_ref: get(github, ["context","payload","pull_request","head","ref"]),
      team_id,
      custom: github
    },
    "Change Succeeded" : {
      stage: "Change",
      status: "Succeeded",
      change_id: get(github, ["context","sha"]),
      pipeline_id: get(github, ["context","payload","pull_request","head","ref"]),
      stage_ref: get(github, ["context","payload","pull_request","head","ref"]),
      team_id,
      custom: github
    }
  };

  // If the fn does not return here, then we don't have a hard match but will
  // do a best-effort to fill in values.
  const found_body = get(event_bodies, findEvent(github, event_defs));
  if (found_body) return found_body;

  // Best effort to find something that can be used as change_id (last is
  // highest priority).
  let pipeline_id = "";
  if (has(github, ["context","ref"])) {
    pipeline_id = github.context.ref;
    console.log("\n--- tmp debug log -------------------------------------------------------------------\n\n",JSON.stringify(github),"\n");
  }
  if (has(github, ["context","payload","pull_request","head","ref"]))
    pipeline_id = github.context.payload.pull_request.head.ref;

  const change_id = pipeline_id;
  const stage_ref = pipeline_id;

  // Best effort construct the HTTP request body
  return ({
    stage: snakeToTitleCase(get(github, ["context","eventName"])),
    status: snakeToTitleCase(get(github, ["context","payload","action"])),
    change_id: change_id,
    stage_ref: stage_ref,
    pipeline_id: pipline_id.replace('refs/heads/',''),
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
                        stage_ref,
                        status,
                        team_id ) => {
  //
  // The presence of any of these values below implies the user wants to specify
  // all of them. In which case, we won't use the GitHub Context object to
  // populate the event API body (we just return all existing values instead).
  //
  if (change_id || stage_ref || custom || pipeline_id || stage || status) {
    return ({
      change_id,

      // the API does not accept empty string or undefined for custom, it must
      // be null or empty object '{}'
      custom : custom ? custom : null,
      pipeline_id,
      stage,
      stage_ref,
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
// Wraps the request to the HTTP API.
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

//
// Checks for a matching value in a deep object
//
// conditions_array[0]  path   []string    path to element in obj
// conditions_array[1]  value  primitive   value we expect to be at the given path
//
const isMatch = (github, conditions_array) => {
  return get(github, conditions_array[0]) === conditions_array[1];
}
module.exports.isMatch = isMatch;

//
// event_def is a data structure that defines each event in terms of matching
// certain values in the github context object. This function determines which
// event has occurred, returning the name of the first event that matches.
//
const findEvent = (github, event_defs) => {
  return get(event_defs.find(e => allPathsMatch(github, e.conditions)), "ctoai_event");
}
module.exports.findEvent = findEvent;

const allPathsMatch = (github, conditions) => {
  return conditions.every((arg) => isMatch(github, arg));
}
module.exports.allPathsMatch = allPathsMatch;
