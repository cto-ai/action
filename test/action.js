const assert = require("assert").strict;
const cloneDeep = require("lodash.clonedeep");

const sendEvent = require("../action.js").sendEvent;
const constructBody = require("../action.js").constructBody;
const getBodyFromGitHubContext = require("../action.js").getBodyFromGitHubContext;
const isMatch = require("../action.js").isMatch;
const allPathsMatch = require("../action.js").allPathsMatch;
const findEvent = require("../action.js").findEvent;

const printTestSuccess = (fnName) => {
  console.log("[ \u001b[32mOK\u001b[0m ]", fnName);
}

const test_findEvent3 = (function test_findEvent3() {
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
  const event_defs = [
    { ctoai_event:"Change Initiated",
      conditions: [
        [ ["context","eventName"], "pull_request" ],
        [ ["context","payload","pull_request","base","ref"], "master" ],
        [ ["context","payload","pull_request","base","ref"], "opened" ]
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
  const actual = findEvent(github_context, event_defs);
  const expected = "Change Succeeded";
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

const test_findEvent1 = (function test_findEvent1() {
  const context = {
    a: {
      b: "c",
    },
    one: "x"
  };
  // even though there is a better match for e3, it will match the first for
  // which all conditions are true (e1)
  const event_defs = [
    { ctoai_event:"e1",
      conditions: [
        [ ["a","b"], "c" ]
      ]
    },
    { ctoai_event:"e2",
      conditions: [
        [ ["one","two","three","four"], "five" ]
      ]
    },
    { ctoai_event:"e3",
      conditions: [
        [ ["a","b"], "c" ],
        [ ["one"], "x" ]
      ]
    }
  ];
  const actual = findEvent(context, event_defs);
  const expected = "e1";
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

const test_findEvent2 = (function test_findEvent2() {
  const context = {
    a: {
      b: "c",
    },
    x: {
      y: "z"
    },
    one:{
      two: {
        three: "four"
      }
    }
  };
  const event_defs = [
    { ctoai_event:"e1",
      conditions: [
        [ ["a","b"], "c" ],
        [ ["x","y"], "z" ],
        [ ["one","two","three"], "four" ]
      ]
    },
    { ctoai_event:"e2",
      conditions: [
        [ ["a"], "b" ],
        [ ["x","y","z"], "q" ],
        [ ["one","two","three","four"], "five" ]
      ]
    },
    { ctoai_event:"e3",
      conditions: [
        [ ["a","b"], "c" ],
        [ ["x","y"], "z" ],
        [ ["one","two","three"], "four" ]
      ]
    }
  ];
  const actual = findEvent(context, event_defs);
  const expected = "e1";
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

const test_allPathsMatch_success = (function test_allPathsMatch_success() {
  const github = {
    context: {
      eventName: "action-test1",
      b: {
        c: "test2",
        d: "test3"
      }
    },
  };
  const conditions =  [
    [ ["context","eventName"], "action-test1" ],
    [ ["context","b","c"], "test2" ],
    [ ["context","b","d"], "test3" ]
  ];
  const actual = allPathsMatch(github, conditions);
  const expected = true;
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

const test_isMatch_success = (function test_isMatch_success() {
  const github = {
    context: {
      eventName: "action-test1"
    },
  };
  const actual = isMatch(github, [ ["context","eventName"], "action-test1" ]);;
  const expected = true;
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

const test_isMatch_fail = (function test_isMatch_fail() {
  const github = {
    context: {
      eventName: "action-test-nomatch"
    },
  };
  const actual = isMatch(github, [ ["context","eventName"], "action-test1" ]);;
  const expected = false;
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
}());

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
  printTestSuccess(arguments.callee.name);
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
  printTestSuccess(arguments.callee.name);
})();

// weird context
const test_getBodyFromGitHubContext_weird_context = (function test_getBodyFromGitHubContext_weird_context() {
  const github_context = {
    "weird": {
      xyz: "abc"
    },
  };
  const actual = getBodyFromGitHubContext("team-id-123", github_context);
  const expected = {
    stage: undefined,
    status: undefined,
    change_id: '',
    team_id: 'team-id-123',
    custom: { weird: { xyz: 'abc' } }
  };
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
})();


// passthru
const test_getBodyFromGitHubContext_passthrough = (function test_getBodyFromGitHubContext_passthrough() {
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
  const actual = getBodyFromGitHubContext("team-id-123", github_context);
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
  printTestSuccess(arguments.callee.name);
})();

// pr closed
const test_getBodyFromGitHubContext_pr_closed = (function test_getBodyFromGitHubContext_pr_closed() {
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
  const actual = getBodyFromGitHubContext("team-id-123", github_context);
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
  printTestSuccess(arguments.callee.name);
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
  printTestSuccess(arguments.callee.name);
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
  printTestSuccess(arguments.callee.name);
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
  printTestSuccess(arguments.callee.name);
})();

// API does not accept empty string or undefined for empty 'custom' field. Must
// be {} or null.
const test_constructBody_null_custom = (function test_constructBody_user_action() {
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
    '',
    github_pull_request_opened,
    "pipeline-id-hijk",
    "test-stage-A",
    "test-status-B",
    "team-id-123"
  );
  expected = {
    change_id: "change-id-abc123",
    custom: null,
    pipeline_id: "pipeline-id-hijk",
    stage: "test-stage-A",
    status: "test-status-B",
    team_id: "team-id-123",
  };
  assert.deepStrictEqual(actual, expected);
  printTestSuccess(arguments.callee.name);
})();
