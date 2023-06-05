import tl from 'azure-pipelines-task-lib/task';
import axios from 'axios'

async function run() {
    try {
        const channelId: string = String(tl.getInput('channelId', true));
        const webhookKey: string = String(tl.getInput('webhookKey', true));
        const name: string | undefined = tl.getInput('name');
        const avatar: string | undefined = tl.getInput('avatar');
        const content: string | undefined = String(tl.getInput('content'));
        const embeds: string | undefined = String(tl.getInput('embeds'));

        let payload: any = {};

        if (name && name.trim().length > 0)
            payload["username"] = name;

        //if (avatar)
        //    payload["avatar_url"] = avatar;

        if (content && content.trim().length > 0)
            payload["content"] = content;

        if (embeds && embeds.trim().length > 0) {
            let embedData: any[] | any = JSON.parse(embeds);
            if(!Array.isArray(embedData)) {
                embedData = [embedData];
            }
            (<any[]>embedData).forEach(x => {
                if(typeof x.color === 'string' && String(x.color).startsWith('0x')) {
                    x.color = Number(x.color);
                } else if(typeof x.color === 'string') {
                    x.color = Number('0x' + x.color);
                }
            });


            payload["embeds"] = JSON.parse(embeds);
            if(typeof payload["embeds"][0].color === 'string') {

            }
        }

        const response = await axios.post(`https://discordapp.com/api/webhooks/${channelId}/${webhookKey}`, payload);
        if(response.status < 200 || response.status > 299) {
            tl.setResult(tl.TaskResult.Failed, `${JSON.stringify(response)}`);
            return;
        }

        tl.setResult(tl.TaskResult.Succeeded, 'webhook message successful');
    } catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run().then(x => 'run completed').catch(x => 'run failed');
