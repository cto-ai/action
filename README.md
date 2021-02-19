# CTO.ai GitHub Action

This Github Action allows you to extend the insights data received by CTO.ai Github App. You can add data to you workflows for deployment tools that are not configured with Github's deployment API.

## Required Inputs

### token
**Required** CTO.ai api token, follow [these docs to generate](https://cto.ai/docs/integrate-any-tool)

### team_id
**Required** CTO.ai team ID sending the data, follow [these docs to access](https://cto.ai/docs/integrate-any-tool)

### event_name
**Required** Name of event being sent i.e. "deployment"

### event_action
**Required** Action associated with event i.e. "failed", "pending", or "succeeded"

## Optional Inputs

### environment
Environment that workflow is running in.

### image
Built image id if available

### branch
Branch used to reference where change is taking place (If not present, action will try to use ref value if available to event type)

### commit
Commit id to uniquely reference the event (If not present, action will try to use SHA value if available to event type)

## Recommendations
Create 2 new secrets for your `token` and `team_id` to be passed into the action.

1. From your GitHub repo, click Settings -> Secrets -> New Secret
  - Create CTOAI_TEAM_ID secret using your CTO.ai-issued Team Id.
  - Create CTOAI_EVENTS_API_TOKEN secret using your CTO.ai-issued API Token.

## Example Usage

If you have a GitHub workflow that deploys your application (i.e. serverless, npm publish, Azure, etc), you can drop this Action in right after that step to capture the success or fail of that deployment! 

We recommend adding `environment` to help us help you differentiate multiple deployment events from the same repository to different environments or workflows. This will be reflected on your Insights Dashboard.

```yaml
- name: Report Deployment Succeeded
  if: ${{ success() }}
  uses: cto-ai/action@v1.2
  id: ctoai-deployment-succeeded
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    event_name: "deployment"
    event_action: "succeeded"
    environment: "production"
- name: Report Deployment Failed
  if: ${{ failure() }}
  uses: cto-ai/action@v1.2
  id: ctoai-deployment-failed
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    event_name: "deployment"
    event_action: "failed"
    environment: "production"
```
