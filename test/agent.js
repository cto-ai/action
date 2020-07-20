const assert = require("assert").strict;
const cloneDeep = require("lodash.clonedeep");

const sendEvent = require("../agent.js").sendEvent;
const constructBody = require("../agent.js").constructBody;
const extractBody = require("../agent.js").extractBody;

const test_sendEvent_failure = (async function test_sendEvent_failure() {
  const body = { abc: "xyz" };
  const token = "tokenxyz";

  const fetchMock = (url_in, opts_in) => {
    const outObj = {};
    outObj.status = 403;
    outObj.statusText  = 'Forbidden';
    return new Promise(success => success(outObj));
  };

  const actual = await sendEvent(body, token, "https://urlabc.tld", fetchMock);
  const expected = {
    HTTPErrorStatus: 403,
    HTTPErrorStatusText: 'Forbidden'
  };
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

const test_sendEvent_success = (async function test_sendEvent_success() {
  const body = { abc: "xyz" };
  const token = "tokenxyz";

  const fetchMock = (url_in, opts_in) => {
    const outObj = {};
    outObj.json = () => (JSON.stringify({ url_in, opts_in }));
    outObj.status = 201;
    return new Promise(success => success(outObj));
  };

  const actual = await sendEvent(body, token, "https://urlabc.tld", fetchMock);
  const expected = JSON.stringify({
    url_in: "https://urlabc.tld",
    opts_in: {
      method: "POST",
      headers: {
        Authorization: "Bearer tokenxyz",
        "Content-Type": "application/json",
      },
      body: '{"abc":"xyz"}',
    },
  });
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// passthru
const test_extractBody_passthrough = (function test_extractBody_passthrough() {
  const github_context = {
    context: {
      payload: {
        action: "unknown_action",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "arbitary-branch",
          },
        },
      },
      eventName: "arbitrary_event",
      ref: "master",
    },
  };
  const actual = extractBody("team-id-123", github_context);
  const expected = {
    stage: "arbitrary_event",
    status: "unknown_action",
    change_id: "arbitary-branch",
    team_id: "team-id-123",
    custom: {
      context: {
        payload: {
          action: "unknown_action",
          pull_request: {
            base: { ref: "master" },
            head: { ref: "arbitary-branch" },
          },
        },
        eventName: "arbitrary_event",
        ref: "master",
      },
    },
  };
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// pr closed
const test_extractBody_pr_closed = (function test_extractBody_pr_closed() {
  const github_context = {
    context: {
      payload: {
        action: "closed",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "branch1",
          },
        },
      },
      eventName: "pull_request",
      ref: "master",
    },
  };
  const actual = extractBody("team-id-123", github_context);
  const expected = {
    stage: "Change",
    status: "Succeeded",
    change_id: "branch1",
    team_id: "team-id-123",
    custom: {
      context: {
        payload: {
          action: "closed",
          pull_request: { base: { ref: "master" }, head: { ref: "branch1" } },
        },
        eventName: "pull_request",
        ref: "master",
      },
    },
  };
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// pr opened
const test_extractBody = (function test_extractBody() {
  const github_context = {
    context: {
      payload: {
        action: "closed",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "branch1",
          },
        },
      },
      eventName: "pull_request",
      ref: "master",
    },
  };

  const actual = extractBody("team-id-123", github_context);
  const expected = {
    stage: "Change",
    status: "Succeeded",
    change_id: "branch1",
    team_id: "team-id-123",
    custom: {
      context: {
        payload: {
          action: "closed",
          pull_request: { base: { ref: "master" }, head: { ref: "branch1" } },
        },
        eventName: "pull_request",
        ref: "master",
      },
    },
  };
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// When user supplies no input, GitHub supplies empty/null/undef values for various
// params. These empty params need to be detected and then the GitHub object
// values used instead to infer the event info.
const test_constructBody_pr_closed = (function test_constructBody_pr_closed() {
  const github_pull_request_closed = {
    context: {
      payload: {
        action: "closed",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "branch1",
          },
        },
      },
      eventName: "pull_request",
      ref: "master",
    },
  };

  const actual = constructBody(
    "",
    "",
    github_pull_request_closed,
    "",
    null,
    undefined,
    "team-id-test1"
  );

  const expected = {
    stage: "Change",
    status: "Succeeded",
    change_id: "branch1",
    team_id: "team-id-test1",
    custom: {
      context: {
        payload: {
          action: "closed",
          pull_request: {
            base: {
              ref: "master",
            },
            head: {
              ref: "branch1",
            },
          },
        },
        eventName: "pull_request",
        ref: "master",
      },
    },
  };

  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// when the user supplies no input, resulting in empty params
const test_constructBody_pr_opened = (function test_constructBody_pr_opened() {
  const github_pull_request_opened = {
    context: {
      payload: {
        action: "opened",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "branch1",
          },
        },
      },
      eventName: "pull_request",
      ref: "master",
    },
  };

  const actual = constructBody(
    "",
    null,
    github_pull_request_opened,
    undefined,
    "",
    "",
    "team-id-test1"
  );

  const expected = {
    stage: "Change",
    status: "Initiated",
    change_id: "branch1",
    team_id: "team-id-test1",
    custom: {
      context: {
        payload: {
          action: "opened",
          pull_request: {
            base: {
              ref: "master",
            },
            head: {
              ref: "branch1",
            },
          },
        },
        eventName: "pull_request",
        ref: "master",
      },
    },
  };
  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();

// Even when given the PR opened metadata from GitHub,
// the user supplied data should overwrite it.
const test_constructBody_user_action = (function test_constructBody_user_action() {
  const github_pull_request_opened = {
    context: {
      payload: {
        action: "opened",
        pull_request: {
          base: {
            ref: "master",
          },
          head: {
            ref: "branch1",
          },
        },
      },
      eventName: "pull_request",
      ref: "master",
    },
  };

  const actual = constructBody(
    "change-id-abc123",
    '{"s":[1,2,3],"g":4}',
    github_pull_request_opened,
    "pipeline-id-hijk",
    "test-stage-A",
    "test-status-B",
    "team-id-123"
  );

  expected = {
    change_id: "change-id-abc123",
    custom: '{"s":[1,2,3],"g":4}',
    pipeline_id: "pipeline-id-hijk",
    stage: "test-stage-A",
    status: "test-status-B",
    team_id: "team-id-123",
  };

  assert.deepStrictEqual(actual, expected);
  console.log("[ OK ]", arguments.callee.name);
})();
