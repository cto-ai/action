'use strict'

const { test } = require('tap')
const nock = require('nock')
const { run } = require('../src/run')

// Import fixtures
const push_payload = require('./fixtures/push')
const pull_request_payload = require('./fixtures/pull_request')
const deployment_payload = require('./fixtures/deployment')
const deployment_status_payload = require('./fixtures/deployment_status')
const status_payload = require('./fixtures/status')
const package_payload = require('./fixtures/package')
const release_payload = require('./fixtures/release')
const issue_payload = require('./fixtures/issue')

const TOKEN = 'jifeo2903u089jf3920'
const TEAM_ID = 'i992-j9f23j09-j092j0'

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
    payload: push_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'simple-tag',
      commit: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: push_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: pull_request_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: 'ec26c3e57ca3a959ca5aad62de7213c562f8c821',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    eventName: 'push',
    payload: pull_request_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: 'f95f852bd8fca8fcc58a9a2d6c842781e32a215e',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: 'f95f852bd8fca8fcc58a9a2d6c842781e32a215e',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: 'f95f852bd8fca8fcc58a9a2d6c842781e32a215e',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: deployment_status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: status_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: package_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: null,
      repo: 'Codertocat/hello-world-npm'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: package_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/hello-world-npm'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: release_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: 'master',
      commit: null,
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: release_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: 'test',
      image: 'image-1',
      branch: 'branch-1',
      commit: '88888',
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

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
    payload: issue_payload
  }

  const req = nock('https://events.cto.ai')
    .post('/', {
      team_id: TEAM_ID,
      event_name: 'deployment',
      event_action: 'succeeded',
      environment: null,
      image: null,
      branch: null,
      commit: null,
      repo: 'Codertocat/Hello-World'
    })
    .reply(200, { message: 'event written', data: {} })

  await run(context)
  is(req.isDone(), true)

  clearInput('token')
  clearInput('team_id')
  clearInput('event_name')
  clearInput('event_action')
})
