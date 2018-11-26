import tl = require('azure-pipelines-task-lib/task');
let request = require('request');

async function run() {
    try {
        const channelId: string = tl.getInput('channelId', true);
        const webhookKey: string = tl.getInput('webhookKey', true);
        const name: string = tl.getInput('name');
        const avatar: string = tl.getInput('avatar');
        const messageType: string = tl.getInput('messageType', true);
        const content: string = tl.getInput('content');
        const embeds: string = tl.getInput('embeds');

        var payload:any = {};

        if (name)
            payload["username"] = name;

        if (avatar)
            payload["avatar_url"] = avatar;

        if (messageType === "content")
            payload["content"] = content;
        else if (messageType === "embeds"){}
            payload["embeds"] = JSON.parse(embeds);

        request({
            url: `https://discordapp.com/api/webhooks/${channelId}/${webhookKey}`,
            method: "POST",
            json: true,
            body: payload
        }, function (error:any, response:any, body:any){
            if (response.statusCode !== 204)
                tl.setResult(tl.TaskResult.Failed, `${response.statusCode} ${body.message}`);
            else
                tl.setResult(tl.TaskResult.Succeeded, 'webhook message successful');
        });
        
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();