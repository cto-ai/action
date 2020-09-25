# CTO.ai GitHub Action

The CTO.ai GitHub Action makes it easy to integrate GitHub into the CTO.ai
Delivery Metrics platform.

## CTO.ai Drop-In GitHub Action Agent

The CTO.ai Drop-In GitHub Agent will automatically record some CTO.ai Delivery
& LifeCycle Metrics that can then be viewed on the CTO.ai Delivery Metrics
dashboard.

### Install Agent

1. From your GitHub repo, click Settings -> Secrets -> New Secret
  - Create CTOAI_TEAM_ID secret using your CTO.ai-issued Team Id.
  - Create CTOAI_EVENTS_API_TOKEN secret using your CTO.ai-issued API Token.
2. Access the CTO.ai Agent workflow from:
  - https://github.com/cto-ai/agent/blob/master/.github/workflows/ctoai-agent.yml
3. Place `ctoai-agent.yml` in the workflows folder of your repo:
  - .github/workflows/ctoai-agent.yml
4. You're done! Delivery & LifeCycle Metrics can now be viewed on the Metrics
   Dashboard.

See a live example of this instrumentation in the [deployment-action-example](https://github.com/cto-ai/deployment-action-example)
repo, which instruments an Azure deployment pipeline.

The CTO.ai GitHub Action accepts the same parameters as the regular CTO.ai
Delivery Metrics APIs, which are explained in greater detail at the
[CTO.ai Official Documentation](cto.ai/docs/delivery-metrics).


