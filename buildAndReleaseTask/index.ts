import tl = require('azure-pipelines-task-lib/task');
import { stringify } from 'querystring';
let request = require('request');
//import { Newline } from './utility/newline';

async function run() {
    try {
        const channelId: string = String(tl.getInput('channelId', true));
        const webhookKey: string = String(tl.getInput('webhookKey', true));
        const name: string | undefined = tl.getInput('name');
        const avatar: string | undefined = tl.getInput('avatar');
        const messageType: string = String(tl.getInput('messageType', true));
        const content: string = String(tl.getInput('content'));
        const embeds: string = String(tl.getInput('embeds'));

        var payload:any = {};

        if (name)
            payload["username"] = name;

        //if (avatar)
        //    payload["avatar_url"] = avatar;

        if (messageType === "content")
            payload["content"] = content;
        else if (messageType === "embeds")
            payload["embeds"] = JSON.parse(embeds);
        //payload["embeds"] = JSON.parse(new Newline().generate(embeds));
        
        request({
            url: `https://discordapp.com/api/webhooks/${channelId}/${webhookKey}`,
            method: "POST",
            json: true,
            body: payload
        }, function (error:any, response:any, body:any){
            if (response.statusCode !== 204)
                tl.setResult(tl.TaskResult.Failed, `${JSON.stringify(response)}`);
            else
                tl.setResult(tl.TaskResult.Succeeded, 'webhook message successful');
        });
        
    } catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();