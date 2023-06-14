![Test](https://github.com/cto-ai/action/workflows/Test/badge.svg)

# CTO.ai GitHub Action

This GitHub Action allows you to extend the Insights data received by the CTO.ai GitHub App. You can add data to you workflows for deployment tools that are not configured with GitHub's Deployments API.

## Required Inputs

### `token`

The `token` field should be your CTO.ai API token. You can follow [our docs to generate](https://cto.ai/docs/integrate-any-tool) your API token.

### `team_id`

Instructions for finding the CTO.ai Team ID which owns the received data can also be found [in our docs](https://cto.ai/docs/integrate-any-tool).

### `event_name`

The name which represents the event being sent, e.g. "deployment".

### `event_action`

The state resulting from the event taking action, e.g. "failure" or "success".

## Optional Inputs

The following field are optional inputs to this GitHub Action, but may be required by more complex builds.

### `branch`

The `branch` field refers to the git branch name where the change occurs. When absent, the action will use the `ref` of the branch triggering the workflow.

### `commit`

The `commit` field refers to the commit hash representing the current change. When absent, the pipe will use the hash of the head commit of the branch that trigger this workflow.

### `repo`

The `repo` field refers to the name of the repository where the change is occurring. When absent, the action will use the name of the repository that initiated this workflow run.

### `environment`

The `environment` field refers to the environment in which the workflow is running.

### `image`

The `image` field refers to the OCI image name or ID associated with this event.

## Recommendations

Create 2 new secrets for your `token` and `team_id` to be passed into the action.

1. From your GitHub repo, click Settings -> Secrets -> New Secret
2. Create `CTOAI_TEAM_ID` secret using your CTO.ai-issued Team ID.
3. Create `CTOAI_EVENTS_API_TOKEN` secret using your CTO.ai-issued API Token.

## Example Usage

If you have a GitHub workflow that deploys your application (e.g. serverless, npm publish, Azure, etc), you can drop this Action in right after that step to capture the success or fail of that deployment!

We recommend adding `environment` to help differentiate multiple deployment events from the same repository to different environments or workflows. This will be reflected on your Insights Dashboard.

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
