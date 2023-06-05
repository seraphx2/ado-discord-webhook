# Discord Webhook

This is a simple task that allows the integration of a Discord Webhook into your BUILD or RELEASE pipeline.

Note: This IS NOT a Service Connection.

## Inputs
- **Webhook ID** (required): Sets the webhook ID.
- **Webhook Key** (required): Sets the webhook Key
- **Name**: Overrides the username of your message.
- **Avatar Image URL**: Overrides the avatar URL of your message.
- **Content**: Sets the content of your message.
- **Embeds**: Sets the embeds of your message. You can include up to 10 embeds.
- **TTS**: Enables TTS for your message.

## Creating a webhook
When [creating a webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for a channel in a Discord server, you will be given a url which contains the Webhook ID and the Secret Key for that webhook in this format: https://discordapp.com/api/webhooks/{webhookId}/{webhookKey}.
You will not need to provide the url to the task, but rather just the Webhook ID and Secret Key.
(The first section in the link above, *Making a Webhook*, is all that needs to be followed to be able to use this task)

Please read the [Discord webhook message API](https://discordapp.com/developers/docs/resources/webhook#execute-webhook) to better understand the fields provided in this task; especially the [embeds](https://discordapp.com/developers/docs/resources/channel#embed-object) section if you want more control over your message.
By entering one or multiple **Embeds** into the task, you have total control over the message content based on what the API expects to be provided in JSON content.

## Examples
### YAML
Following task sends a discord notification message when one of the previous tasks failed.
```yaml
- task: ado-discord-webhook@1
  displayName: 'Discord Notification for build failure'
  condition: failed()
  inputs:
    webhookId: '$(discord_channelId)'
    webhookKey: '$(discord_webhookKey)'
    content: '<@&$(discord_mentionRoleId)>'
    embeds: |
      [
        {
          "type": "rich",
          "title": "$(Build.DefinitionName) ($(Build.BuildNumber))",
          "description": "Build failed!",
          "color": 0xff0000,
          "fields": [
            {
              "name": "Build.RequestedFor",
              "value": "$(Build.RequestedFor)",
              "inline": true
            },
            {
              "name": "Build.Reason",
              "value": "$(Build.Reason)",
              "inline": true
            }
          ],
          "url": "$(System.CollectionUri)/$(System.TeamProject)/_build/results?buildId=$(Build.BuildId)&view=logs"
        }
      ]
```

### Classic
![Screenshot](https://user-images.githubusercontent.com/11561820/50299671-2c619c00-0450-11e9-87c2-530e65e4d3ea.png)

## Full documentation
Please refer to the documentation on the [github repository](https://github.com/seraphx2/ado-discord-webhook) for full and up-to-date instructions.
