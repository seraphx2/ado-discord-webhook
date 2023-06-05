import axios = require('axios');
export class AzureTask {
    tl: any;

    constructor() {
        this.tl = require('azure-pipelines-task-lib/task');
    }

    postProcessString(raw?: string): string | undefined {
        if (raw === undefined || raw === 'undefined')
            return undefined;

        return String(raw).trim();
    }

    postProcessRawEmbeds(rawEmbeds?: string): any[] | undefined {
        if (rawEmbeds === undefined || rawEmbeds === 'undefined')
            return undefined;

        // replace ` with "
        rawEmbeds = rawEmbeds.replace(/`/g, '"');

        // replace hex numbers with integers
        const hexNumberMatches = Array.from(rawEmbeds.matchAll(/(?<prefix>\W)(?<hex>(?:0x)?[0-9A-Fa-f]{6})(?<suffix>\W)/g));
        for (let i = hexNumberMatches.length - 1; i >= 0; i--) {
            const match = hexNumberMatches[i];
            const prefix = String(match.groups!['prefix']);
            const hex = String(match.groups!['hex']);
            const suffix = String(match.groups!['suffix']);

            if(prefix === '\'' || prefix === '"')
                continue;

            if(hex.startsWith('0x')) {
                const int = Number(hex);
                const newEmbed: string = rawEmbeds!.substring(0, match.index! + 1) + String(int) + rawEmbeds!.substring(match.index! + 1 + hex.length);

                rawEmbeds = newEmbed;
            } else {
                const int = Number('0x' + hex);
                const newEmbed: string = rawEmbeds!.substring(0, match.index! + 1) + String(int) + rawEmbeds!.substring(match.index! + match.length - 1);

                rawEmbeds = newEmbed;
            }

        }

        // convert to object
        console.log('PARSING EMBED: ', rawEmbeds);
        let embedData: any[] | any = JSON.parse(rawEmbeds);

        // if it's not in array format already, wrap it
        if (!Array.isArray(embedData)) {
            embedData = [embedData];
        }

        return embedData;
    }

    generatePayload() {
        const name: string | undefined = this.postProcessString(this.tl.getInput('name'));
        const tts: boolean = this.postProcessString(this.tl.getInput('tts')) === 'true';
        const avatarUrl: string | undefined = this.postProcessString(this.tl.getInput('avatar'));
        const content: string | undefined = this.postProcessString(this.tl.getInput('content'));
        const embeds: any[] | undefined = this.postProcessRawEmbeds(this.tl.getInput('embeds'));

        const payload: any = {};

        if (name && name.length > 0) {
            payload["username"] = name;
        }

        if (avatarUrl && avatarUrl.length > 0) {
           payload["avatar_url"] = avatarUrl;
        }

        payload["tts"] = tts;

        // Set content if exists
        if (content && content.length > 0) {
            payload["content"] = content;
        }

        // Set embeds if exist
        if (embeds && embeds.length > 0) {
            payload["embeds"] = embeds;
        }

        return payload;
    }

    isSuccess(response: axios.AxiosResponse): boolean {
        return response.status >= 200 && response.status < 300;
    }


    async run(): Promise<boolean> {

        try {
            const channelId: string = String(this.tl.getInput('channelId', true));
            const webhookKey: string = String(this.tl.getInput('webhookKey', true));
            const payload: any = this.generatePayload();

            const response = await axios.default.post(`https://discordapp.com/api/webhooks/${channelId}/${webhookKey}`, payload);
            if (!this.isSuccess(response)) {
                console.log('Request failed [text]: ', response.statusText);
                console.log('Request failed [data]: ', response.data);
                this.tl.setResult(this.tl.TaskResult.Failed, `${JSON.stringify(response)}`);
                return false;
            }

            this.tl.setResult(this.tl.TaskResult.Succeeded, 'webhook message successful');
            return true;
        } catch (err: any) {
            this.tl.setResult(this.tl.TaskResult.Failed, JSON.stringify(err));
            return false;
        }
    }
}
