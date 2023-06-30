import axios = require('axios');
import AzurePipelinesTaskLib = require('azure-pipelines-task-lib');
import {AxiosResponse} from 'axios';

export type DiscordMessageResponse = {
    id: string
    // and lots of other (unnecessary) properties, see: https://discord.com/developers/docs/resources/channel#message-object
}

export enum UpdateMessageMode {
    none = 'none',
    edit = 'edit',
    replace = 'replace'
}

function getUpdateMessageMode(updateMessageModeRaw: string | undefined) {
    updateMessageModeRaw = updateMessageModeRaw?.toLowerCase() ?? UpdateMessageMode.none;

    if (updateMessageModeRaw === UpdateMessageMode.none || updateMessageModeRaw === UpdateMessageMode.edit || updateMessageModeRaw === UpdateMessageMode.replace)
        return updateMessageModeRaw;

    console.log('Illegal updateMessageMode. Expected: none | edit | replace, Actual: ', updateMessageModeRaw);
    console.log('Falling back to none.');
    return UpdateMessageMode.none;
}

function processString(raw: string | undefined): string | undefined {
    if (raw === undefined || raw === 'undefined' || raw === '')
        return undefined;

    return String(raw).trim();
}

function generateCommonPayload(inputs: Inputs, basePayload?: any) {
    const payload: any = basePayload ?? {};

    // Set content if exists
    if (inputs.content && inputs.content.length > 0) {
        payload["content"] = inputs.content;
    }

    // Set embeds if exist
    if (inputs.embeds && inputs.embeds.length > 0) {
        payload["embeds"] = inputs.embeds;
    }

    return payload;
}

function generateCreatePayload(inputs: Inputs, basePayload?: any) {
    const payload: any = basePayload ?? {};

    generateCommonPayload(inputs, payload);

    if (inputs.name && inputs.name.length > 0) {
        payload["username"] = inputs.name;
    }

    if (inputs.avatar && inputs.avatar.length > 0) {
        payload["avatar_url"] = inputs.avatar;
    }

    payload["tts"] = inputs.tts;

    return payload;
}

function generateEditPayload(inputs: Inputs, basePayload?: any) {
    return generateCommonPayload(inputs, basePayload);
}

export function postProcessRawEmbeds(rawEmbeds?: string): any[] | undefined {
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

        if (prefix === '\'' || prefix === '"')
            continue;

        if (hex.startsWith('0x')) {
            const int = Number(hex);
            rawEmbeds = rawEmbeds.substring(0, match.index! + 1) + String(int) + rawEmbeds.substring(match.index! + 1 + hex.length);
        } else {
            const int = Number('0x' + hex);
            rawEmbeds = rawEmbeds.substring(0, match.index! + 1) + String(int) + rawEmbeds.substring(match.index! + match.length - 1);
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


function isSuccess(response: axios.AxiosResponse): boolean {
    return response.status >= 200 && response.status < 300;
}

export class Inputs {
    webhookId!: string;
    webhookKey!: string;
    updateMessageMode?: UpdateMessageMode = UpdateMessageMode.none;
    updateMessageId?: string;
    name?: string;
    tts?: boolean = false;
    avatar?: string;
    content?: string;
    embeds?: any[]
}

export class AzureTask {
    task: typeof AzurePipelinesTaskLib = require('azure-pipelines-task-lib');
    inputs: Inputs;

    constructor(inputs?: Inputs) {
        this.inputs = this.getInputs(inputs);
    }

    async run(): Promise<boolean> {

        try {
            let message = null;
            switch (this.inputs.updateMessageMode) {
                case UpdateMessageMode.none:
                    message = await this.createMessage();
                    break;
                case UpdateMessageMode.edit:
                    try {
                        message = await this.editMessage()
                    } catch(ex) {
                        console.log('Editing message FAILED. Trying to CREATE a new message instead. Exception was:\n\n' + JSON.stringify(ex));
                        message = await this.createMessage();
                    }

                    break;
                case UpdateMessageMode.replace:
                    try {
                        await this.deleteMessage();
                    } catch(ex) {
                        console.log('Deleting message FAILED. Trying to move on. Exception was:\n\n' + JSON.stringify(ex));
                    }

                    message = await this.createMessage();
                    break;
            }

            if (!message) { // noinspection ExceptionCaughtLocallyJS
                throw new Error('Discord\'s response didnt contain a message!');
            }


            this.task.setVariable('discordWebhookMessageId', message.id, false, true);
            this.task.setVariable('discordWebhookLastMessageId', message.id);
            process.env.discordWebhookLastMessageId = message.id;
            this.task.setResult(this.task.TaskResult.Succeeded, 'webhook message successful');
            return true;
        } catch (err: any) {
            this.task.setResult(this.task.TaskResult.Failed, JSON.stringify(err));
            return false;
        }
    }

    private getInputs(base?: Inputs): Inputs {
        const inputs: Inputs = base ?? {
            webhookId: processString(this.task.getInputRequired('webhookId'))!,
            webhookKey: processString(this.task.getInputRequired('webhookKey'))!,

            updateMessageMode: getUpdateMessageMode(processString(this.task.getInput('updateMessageMode'))),
            updateMessageId: processString(this.task.getInput('updateMessageId')),

            name: processString(this.task.getInput('name')),
            tts: this.task.getBoolInput('tts'),
            avatar: processString(this.task.getInput('avatar')),
            content: processString(this.task.getInput('content')),
            embeds: postProcessRawEmbeds(this.task.getInput('embeds')),
        };

        inputs.updateMessageId ??= process.env.discordWebhookLastMessageId;

        return inputs;
    }

    private async createMessage() {
        console.log('Creating message...');

        const payload: any = generateCreatePayload(this.inputs);
        const response = await axios.default.post<any, AxiosResponse<DiscordMessageResponse>, any>(`https://discordapp.com/api/webhooks/${this.inputs.webhookId}/${this.inputs.webhookKey}?wait=true`, payload);

        if (isSuccess(response))
            return response.data;

        console.log('Request failed [text]: ', response.statusText);
        console.log('Request failed [data]: ', response.data);

        throw new Error('Creating message was unsuccessful.\nResponse: ' + JSON.stringify(response))
    }

    private async editMessage() {
        console.log('Editing message...');
        if(!this.inputs.updateMessageId) {
            throw new Error('updateMessageId is undefined')
        }

        const payload: any = generateEditPayload(this.inputs);
        const response = await axios.default.patch<any, AxiosResponse<DiscordMessageResponse>, any>(`https://discordapp.com/api/webhooks/${this.inputs.webhookId}/${this.inputs.webhookKey}/messages/${this.inputs.updateMessageId}`, payload);

        if (isSuccess(response))
            return response.data;

        console.log('Request failed [text]: ', response.statusText);
        console.log('Request failed [data]: ', response.data);

        throw new Error('Editing message with messageId ' + this.inputs.updateMessageId + ' was unsuccessful.\nResponse: ' + JSON.stringify(response))
    }

    private async deleteMessage() {
        console.log('Deleting message...');
        if(!this.inputs.updateMessageId) {
            throw new Error('updateMessageId is undefined')
        }

        const response = await axios.default.delete(`https://discordapp.com/api/webhooks/${this.inputs.webhookId}/${this.inputs.webhookKey}/messages/${this.inputs.updateMessageId}`);

        if (isSuccess(response))
            return;

        console.log('Request failed [text]: ', response.statusText);
        console.log('Request failed [data]: ', response.data);

        throw new Error('Deleting message with messageId ' + this.inputs.updateMessageId + ' was unsuccessful.\nResponse: ' + JSON.stringify(response));
    }
}
