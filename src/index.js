'use strict';

const core = require('@actions/core');
const { run } = require('./run');

(async () => {
  try {
    await run()
    console.log('Successfully sent event data!')
  } catch (err) {
    core.setFailed(`Ops Platform Action failed with error: ${err}`)
  }
})();

