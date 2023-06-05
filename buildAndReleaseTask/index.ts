import tl = require('azure-pipelines-task-lib/task');
import axios, {AxiosResponse} from 'axios'

function postProcessRawEmbeds(rawEmbeds?: string): string | undefined {
    if(!rawEmbeds)
        return rawEmbeds;

    rawEmbeds = rawEmbeds.replaceAll('`', '"');

    return rawEmbeds;
}

function generatePayload() {
    const name: string | undefined = String(tl.getInput('name'));
    const avatar: string | undefined = String(tl.getInput('avatar'));
    const content: string | undefined = String(tl.getInput('content'));
    const embeds: string | undefined = postProcessRawEmbeds(String(tl.getInput('embeds')));

    const payload: any = {};

    if (name && name.trim().length > 0) {
        payload["username"] = name;
    }

    //if (avatar) {
    //    payload["avatar_url"] = avatar;
    //}

    // Set content if exists
    if (content && content.trim().length > 0) {
        payload["content"] = content;
    }

    // Set embeds if exist
    if (embeds && embeds.trim().length > 0) {
        let embedData: any[] | any = JSON.parse(embeds);

        // if it's not in array format already, wrap it
        if (!Array.isArray(embedData)) {
            embedData = [embedData];
        }

        // convert hex color values to integers
        (<any[]>embedData).forEach(x => {
            if (typeof x.color === 'string' && String(x.color).startsWith('0x')) {
                x.color = Number(x.color);
            } else if (typeof x.color === 'string') {
                x.color = Number('0x' + x.color);
            }
        });
        payload["embeds"] = JSON.parse(embeds);
    }

    return payload;
}

function isSuccess(response: AxiosResponse): boolean {
    return response.status >= 200 && response.status < 300;
}


async function run() {
    try {
        const channelId: string = String(tl.getInput('channelId', true));
        const webhookKey: string = String(tl.getInput('webhookKey', true));
        const payload: any = generatePayload();

        const response = await axios.post(`https://discordapp.com/api/webhooks/${channelId}/${webhookKey}`, payload);
        if (!isSuccess(response)) {
            tl.setResult(tl.TaskResult.Failed, `${JSON.stringify(response)}`);
            return;
        }

        tl.setResult(tl.TaskResult.Succeeded, 'webhook message successful');
    } catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run()
    .then(x => 'run completed')
    .catch(x => 'run failed');
