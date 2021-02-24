'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const got = require('got');

/**
 * Helper function to extract branch if not specified.
 * @param {String} eventName - name of the event triggering the Github Action
 * @param {Object} payload - context payload containing the data of the event
 * @returns {(String|null)} found branch with stripped /refs/heads or null
 */
const getBranch = (eventName, payload) => {
  if (eventName === 'push') {
    return payload.ref.replace('refs/heads/', '').replace('refs/tags/', '');
  } else if (eventName === 'pull_request') {
    return payload.pull_request.base.ref.replace('refs/heads/', '');
  } else if (eventName === 'deployment') {
    return payload.deployment.ref.replace('refs/heads/', '');
  } else if (eventName === 'deployment_status') {
    return payload.deployment.ref.replace('refs/heads/', '');
  } else if (eventName === 'package') {
    return payload.package.package_version.release.target_commitish;
  } else if (eventName === 'release') {
    return payload.release.target_commitish;
  } else if (eventName === 'status') {
    return payload.branches[0].name.replace('refs/heads/', '');
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
    return payload.before;
  } else if (eventName === 'pull_request') {
    return payload.pull_request.head.sha;
  } else if (eventName === 'deployment') {
    return payload.deployment.sha;
  } else if (eventName === 'deployment_status') {
    return payload.deployment.sha;
  } else if (eventName === 'status') {
    return payload.sha;
  }
  return null;
}

/**
 * Main entrypoint for action that collects up data and sends to insights api.
 * @param {(Object|null)} context - optional param used for injecting in tests that matches github.context format.
 * @returns {Promise} sent request data payload to events api
 */
const run = async (context) => {
  const eventName = context != null ? context.eventName : github.context.eventName
  const payload = context != null ? context.payload : github.context.payload
  const token = core.getInput('token');
  const team_id = core.getInput('team_id');
  core.setSecret(token)
  core.setSecret(team_id)
  const body = {
    team_id,
    event_name: core.getInput('event_name'),
    event_action: core.getInput('event_action'),
    environment: core.getInput('environment') || null,
    image: core.getInput('image') || null,
    branch: core.getInput('branch') || getBranch(eventName, payload),
    commit: core.getInput('commit') || getSha(eventName, payload),
    repo: payload.repository.full_name
  };
  return got.post('https://events.cto.ai/', {
    headers: { 
      Authorization: `Bearer ${token}`,
      'x-ops-mechanism': 'github-action'
    },
    json: body
  });
}

module.exports = { run };
