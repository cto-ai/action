# CTO.ai GitHub Action

The CTO.ai GitHub Action makes it easy to integrate GitHub into the CTO.ai
Delivery Metrics platform.

## CTO.ai Drop-In GitHub Action Agent

The CTO.ai Drop-In GitHub Agent will automatically record some CTO.ai Delivery
& LifeCycle Metrics that can then be viewed on the CTO.ai Delivery Metrics
dashboard.

### Install Agent

1. From your GitHub repo, click Settings -> Secrets -> New Secret
  1.1. Create CTOAI_TEAM_ID secret using your CTO.ai-issued Team Id.
  1.2. Create CTOAI_EVENTS_API_TOKEN secret using your CTO.ai-issued API Token.
2. Access the CTO.ai Agent workflow from:
  - https://github.com/cto-ai/agent/blob/master/.github/workflows/ctoai-agent.yml
3. Place `ctoai-agent.yml` in the workflows folder of your repo:
  - .github/workflows/ctoai-agent.yml
4. You're done! Delivery & LifeCycle Metrics can now be viewed on the Metrics
   Dashboard.

## Manually Instrument Pipelines using the CTO.ai Action

In addition to the drop-in Agent, you can manually instrument your GitHub
action workflows with specific LifeCycle events that you specify. For example,
if you have a GitHub workflow that deploys your application to Azure, you could
add steps to this workflow that use the CTO.ai Action (cto-ai/action) to store
metrics. The CTO.ai Action will store the event information that you specify,
and those metrics can then be visible on the CTO.ai Delivery Metrics Dashboard.

The CTO.ai steps that you can add to your workflows look like this:

```
- name: Report Build Succeeded
  if: ${{ success() }}
  uses: cto-ai/action@v1-beta
  id: ctoai-build-succeeded
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    stage: "Build"
    status: "Succeeded"
    change-id: "your-change-id1"
    pipeline-id: "your-pipeline-id1"
- name: Report Build Failed
  if: ${{ failure() }}
  uses: cto-ai/action@v1-beta
  id: ctoai-build-failed
  with:
    team_id: ${{ secrets.CTOAI_TEAM_ID }}
    token: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    stage: "Build"
    status: "Failed"
    change-id: "your-change-id1"
    pipeline-id: "your-pipeline-id1"
```

See a live example of this instrumentation in the [deployment-action-example](https://github.com/cto-ai/deployment-action-example)
repo, which instruments an Azure deployment pipeline.

The CTO.ai GitHub Action accepts the same parameters as the regular CTO.ai
Delivery Metrics APIs, which are explained in greater detail at the
[CTO.ai Official Documentation](cto.ai/docs/delivery-metrics).


