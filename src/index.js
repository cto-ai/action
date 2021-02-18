'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const got = require('got');

/**
 * Helper function to extract branch if not specified.
 * @param {String} eventName - name of the event triggering the Github Action
 * @param {Object} payload - context payload containing the data of the event
 * @returns {(String|null)} found branch or null
 */
const getBranch = (eventName, payload) => {
  if (eventName === 'push') {
    return payload.ref;
  } else if (eventName === 'pull_request') {
    return payload.pull_request.base.ref;
  } else if (eventName === 'deployment') {
    return payload.deployment.ref;
  } else if (eventName === 'deployment_status') {
    return payload.deployment.ref;
  } else if (eventName === 'status') {
    return payload.branches ? payload.branches[0] : null;
  }
  return null;
}

/**
 * Helper function to extract commit if not specified.
 * @param {String} eventName - name of the event triggering the Github Action
 * @param {Object} payload - context payload containing the data of the event
 * @returns {(String|null)} found sha or null
 */
const getSha = (eventName, payload) => {
  if (eventName === 'push') {
    return payload.after;
  } else if (eventName === 'pull_request') {
    return payload.pull_request.head.sha;
  } else if (eventName === 'deployment') {
    return payload.deployment.sha;
  } else if (eventName === 'deployment_status') {
    return payload.deployment.sha;
  } else if (eventName === 'package') {
    return payload.package.package_version.release.target_commitish;
  } else if (eventName === 'release') {
    return payload.release.target_commitish;
  } else if (eventName === 'status') {
    return payload.sha;
  }
  return null;
}

/**
 * Main entrypoint for action that collects up data and sends to insights api.
 */
const run = async () => {
  const { eventName, payload } = github.context;
  const token = core.getInput('token');
  const team_id = core.getInput('team_id');
  core.setSecret(token)
  core.setSecret(team_id)
  const body = {
    token,
    team_id,
    event_name: core.getInput('event_name'),
    event_action: core.getInput('event_action'),
    environment: core.getInput('environment') || null,
    image: core.getInput('image') || null,
    branch: core.getInput('branch') || getBranch(eventName, payload),
    commit: core.getInput('commit') || getSha(eventName, payload)
  };
  return got.post(process.env.INSIGHTS_API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    json: body
  });
}

(async () => {
  try {
    await run()
  } catch (err) {
    core.setFailed(`Ops Platform Action failed with error: ${err}`)
  }
})();

module.exports = { run };
