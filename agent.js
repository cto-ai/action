const cloneDeep = require('lodash.clonedeep');
const has = require('lodash.has');

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
