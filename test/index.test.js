'use strict'

const { test } = require('tap')
const nock = require('nock')
const { run } = require('../src/run')

// Import fixtures
const pushPayload = require('./fixtures/push')
const pullRequestPayload = require('./fixtures/pull_request')
const deploymentPayload = require('./fixtures/deployment')
const deploymentStatusPayload = require('./fixtures/deployment_status')
const statusPayload = require('./fixtures/status')
const packagePayload = require('./fixtures/package')
const releasePayload = require('./fixtures/release')
const issuePayload = require('./fixtures/issue')

// These params are used for integration testing.
const { NOCK_ENABLED, OPS_PLATFORM_TEST_TOKEN } = process.env

const TOKEN = OPS_PLATFORM_TEST_TOKEN || 'jifeo2903u089jf3920'
const TEAM_ID = 'i992-j9f23j09-j092j0'
const USER = { user: 'Codertocat' }
const ENDPOINT = 'https://events.cto.ai'

const setInput = (name, value) => {
  process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value
}

const clearInput = (name) => {
  delete process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]
}

test('Push event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'push',
    payload: pushPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'simple-tag',
        commit: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Push event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'push',
    payload: pushPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Pull Request event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'pull_request',
    payload: pullRequestPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: 'ec26c3e57ca3a959ca5aad62de7213c562f8c821',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Pull Request event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'pull_request',
    payload: pullRequestPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Deployment event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'deployment',
    payload: deploymentPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: 'f95f852bd8fca8fcc58a9a2d6c842781e32a215e',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Deployment event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'deployment',
    payload: deploymentPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Deployment Status event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'deployment_status',
    payload: deploymentStatusPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: 'f95f852bd8fca8fcc58a9a2d6c842781e32a215e',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Deployment Status event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'deployment_status',
    payload: deploymentStatusPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Status event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'status',
    payload: statusPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Status event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'status',
    payload: statusPayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Package event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'package',
    payload: packagePayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: null,
        repo: 'Codertocat/hello-world-npm',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Package event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'package',
    payload: packagePayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/hello-world-npm',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Release event with only required fields has additional data added', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'release',
    payload: releasePayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: 'master',
        commit: null,
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('Release event with all parameters passed, uses the overwriting values', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')
  setInput('image', 'image-1')
  setInput('branch', 'branch-1')
  setInput('commit', '88888')

  const context = {
    eventName: 'release',
    payload: releasePayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: 'image-1',
        branch: 'branch-1',
        commit: '88888',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})

test('Event without ref or sha only gets the fields passed and repo', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')

  const context = {
    eventName: 'issues',
    payload: issuePayload
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: null,
        image: null,
        branch: null,
        commit: null,
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})

test('fetch commit and branch from context', async ({ is }) => {
  setInput('token', TOKEN)
  setInput('team_id', TEAM_ID)
  setInput('event_name', 'deployment')
  setInput('event_action', 'succeeded')
  setInput('environment', 'test')

  const context = {
    eventName: 'deployment',
    payload: deploymentPayload,
    sha: 'f76e630a4d99b69a8f9e4de16cc8d64e0eeb033b',
    ref: 'refs/heads/branch-1'
  }

  if (NOCK_ENABLED) {
    nock(ENDPOINT)
      .matchHeader('authorization', `Bearer ${TOKEN}`)
      .post('/', {
        team_id: TEAM_ID,
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: 'test',
        image: null,
        branch: 'branch-1',
        commit: 'f76e630a4d99b69a8f9e4de16cc8d64e0eeb033b',
        repo: 'Codertocat/Hello-World',
        meta: USER
      })
      .reply(200, { message: 'event written', data: {} })
  }

  const res = await run(context)
  is(res.statusCode, 200)
  is(JSON.parse(res.body).message, 'event written')

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
  clearInput('environment')
  clearInput('image')
  clearInput('branch')
  clearInput('commit')
})
