![Test](https://github.com/cto-ai/action/workflows/Test/badge.svg)

# CTO.ai GitHub Action

This Github Action allows you to extend the insights data received by CTO.ai Github App. You can add data to you workflows for deployment tools that are not configured with Github's deployment API.

## Required Inputs

### `token`

CTO.ai api token, follow [these docs to generate](https://cto.ai/docs/integrate-any-tool)

### `team_id`

CTO.ai team ID sending the data, follow [these docs to access](https://cto.ai/docs/integrate-any-tool)

### `event_name`

Name of event being sent i.e. "deployment"

### `event_action`

Action associated with event i.e. "failure", "pending", or "success"

## Optional Inputs

The following action fields are optional; however, more complex builds may
require them.

### `branch`

The `branch` field refers to the git branch name where the change occurs. When
absent, the action will use the `ref` value if available to the event type.

### `commit`

The `commit` field refers to the commit id where the change occurs. When absent,
the action will use the SHA value if available to the event type.

### `repo`

The `repo` field refers to the repository name where the change occurs. When
absent, the action will use the repository's name where the workflow runs.

### `environment`

The `environment` field refers to the environment in which the workflow is running.

### `image`

The `image` field refers to the OCI image name or ID associated with this event.

## Recommendations

Create 2 new secrets for your `token` and `team_id` to be passed into the action.

1. From your GitHub repo, click Settings -> Secrets -> New Secret
2. Create `CTOAI_TEAM_ID` secret using your CTO.ai-issued Team Id.
3. Create `CTOAI_EVENTS_API_TOKEN` secret using your CTO.ai-issued API Token.

## Example Usage

If you have a GitHub workflow that deploys your application (i.e. serverless, npm publish, Azure, etc), you can drop this Action in right after that step to capture the success or fail of that deployment!

We recommend adding `environment` to help us help you differentiate multiple deployment events from the same repository to different environments or workflows. This will be reflected on your Insights Dashboard.

```yaml
- name: Report Deployment Succeeded
  if: ${{ success() }}
  uses: cto-ai/action@v1
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    event_name: "deployment"
    event_action: "success"
    environment: "production"
- name: Report Deployment Failed
  if: ${{ failure() }}
  uses: cto-ai/action@v1
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    event_name: "deployment"
    event_action: "failure"
    environment: "production"
```
