# Discord Webhook

This is a rather simple task that allows the integration of a Discord Webhook into your pipeline.

## Key documentation
Reading the Discord documentation, will go a long way to help utilizing this task and understanding how it works.

When [creating a webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for a channel in a Discord server, you will be given a url which contains the Channel ID and the Secret Key for that webhook in this format: https://discordapp.com/api/webhooks/{channelId}/{webhookKey}. You will not need to provide the url to the task, but rather just the Channel ID and Secret Key.
(The first section in the link above, *Making a Webhook*, is all that needs to be followed to be able to use this task)

Please read the [Discord webhook message API](https://discordapp.com/developers/docs/resources/webhook#execute-webhook) to better understand the fields provided in this task; especially the [embeds](https://discordapp.com/developers/docs/resources/webhook#execute-webhook) section if you want more control over your message. By selecting the Message Type of **Embeds** in the task, you have total control over the message content based on what the API expects to be provided in JSON content.

## Screenshot
![Screenshot](https://user-images.githubusercontent.com/11561820/50299671-2c619c00-0450-11e9-87c2-530e65e4d3ea.png)
