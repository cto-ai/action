# CTO.ai GitHub Action

The CTO.ai GitHub Action makes it easy to extend CTO.ai Delivery Insight 
with specific events from your Github Action, such as deployments.


### Install Default Agent

1. From your GitHub repo, click Settings -> Secrets -> New Secret
  - Create CTOAI_TEAM_ID secret using your CTO.ai-issued Team Id.
  - Create CTOAI_EVENTS_API_TOKEN secret using your CTO.ai-issued API Token.
2. Copy all of the CTO.ai Agent workflow from:
  - https://github.com/cto-ai/agent/blob/master/.github/workflows/
3. Place these workflows in the workflows folder of your repo:
  - .github/workflows/ or integrate directly with your existing actions.
4. You're done! Now events from your workflow will be sent!

By default our existing agents assume you use Github Flow. By default we count 
commits to master as a "successful deployment" and pull requests with status closed 
as a "failed deployment". However, if you want to get more accurate with measuring your
actual deployments you should manually instrument your pipeline at this custom stage.

## Manually Instrument Pipelines using the CTO.ai Action

When instrumenting a custom deployment pipeline, you'll need to isolate the code that you 
have created for your deployments and add steps for our action to send us the correct info.

The CTO.ai steps that you should add to your workflows look like this:

```
- name: Report Build Succeeded
  if: ${{ success() }}
  uses: cto-ai/action@v1-beta
  id: ctoai-build-succeeded
  env:
    CTOAI_ACTION_ENVIRONMENT: ${{ secrets.CTOAI_ACTION_ENVIRONMENT }}
    CTOAI_EVENTS_API_TOKEN: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    CTOAI_TEAM_ID: ${{ secrets.CTOAI_TEAM_ID }}
  with:
    event_name: 'deployment'
    event_action: 'succeeded'
    repo: 'org/repo'
    environment: 'production'
    branch: 'main'
    commit: 'cfb11968bb0afe4cad144133996d0da84697cd08'
    image: '6327219d0db0'
- name: Report Build Failed
  if: ${{ failure() }}
  uses: cto-ai/action@v1-beta
  id: ctoai-build-failed
  env:
    CTOAI_ACTION_ENVIRONMENT: ${{ secrets.CTOAI_ACTION_ENVIRONMENT }}
    CTOAI_EVENTS_API_TOKEN: ${{ secrets.CTOAI_EVENTS_API_TOKEN }}
    CTOAI_TEAM_ID: ${{ secrets.CTOAI_TEAM_ID }}
  with:
    event_name: 'deployment'
    event_action: 'failed'
    repo: 'org/repo'
    environment: 'production'
    branch: 'main'
    commit: 'cfb11968bb0afe4cad144133996d0da84697cd08'
    image: '6327219d0db0'
```

## Support

Please ping us in our Slack Community if you have any questions!
