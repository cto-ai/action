'use strict';

const core = require('@actions/core');
const { run } = require('./run');

(async () => {
  try {
    await run()
  } catch (err) {
    core.setFailed(`Ops Platform Action failed with error: ${err}`)
  }
})();

