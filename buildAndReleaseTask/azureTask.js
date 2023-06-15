"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureTask = void 0;
const axios = require("axios");
class AzureTask {
    tl;
    constructor() {
        this.tl = require('azure-pipelines-task-lib/task');
    }
    postProcessString(raw) {
        if (raw === undefined || raw === 'undefined')
            return undefined;
        return String(raw).trim();
    }
    postProcessRawEmbeds(rawEmbeds) {
        if (rawEmbeds === undefined || rawEmbeds === 'undefined')
            return undefined;
        // replace ` with "
        rawEmbeds = rawEmbeds.replace(/`/g, '"');
        // replace hex numbers with integers
        const hexNumberMatches = Array.from(rawEmbeds.matchAll(/(?<prefix>\W)(?<hex>(?:0x)?[0-9A-Fa-f]{6})(?<suffix>\W)/g));
        for (let i = hexNumberMatches.length - 1; i >= 0; i--) {
            const match = hexNumberMatches[i];
            const prefix = String(match.groups['prefix']);
            const hex = String(match.groups['hex']);
            const suffix = String(match.groups['suffix']);
            if (prefix === '\'' || prefix === '"')
                continue;
            if (hex.startsWith('0x')) {
                const int = Number(hex);
                const newEmbed = rawEmbeds.substring(0, match.index + 1) + String(int) + rawEmbeds.substring(match.index + 1 + hex.length);
                rawEmbeds = newEmbed;
            }
            else {
                const int = Number('0x' + hex);
                const newEmbed = rawEmbeds.substring(0, match.index + 1) + String(int) + rawEmbeds.substring(match.index + match.length - 1);
                rawEmbeds = newEmbed;
            }
        }
        // convert to object
        console.log('PARSING EMBED: ', rawEmbeds);
        let embedData = JSON.parse(rawEmbeds);
        // if it's not in array format already, wrap it
        if (!Array.isArray(embedData)) {
            embedData = [embedData];
        }
        return embedData;
    }
    generatePayload() {
        const name = this.postProcessString(this.tl.getInput('name'));
        const tts = this.postProcessString(this.tl.getInput('tts')) === 'true';
        const avatarUrl = this.postProcessString(this.tl.getInput('avatar'));
        const content = this.postProcessString(this.tl.getInput('content'));
        const embeds = this.postProcessRawEmbeds(this.tl.getInput('embeds'));
        const payload = {};
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
    isSuccess(response) {
        return response.status >= 200 && response.status < 300;
    }
    async run() {
        try {
            const webhookId = String(this.tl.getInput('webhookId', true));
            const webhookKey = String(this.tl.getInput('webhookKey', true));
            const payload = this.generatePayload();
            const response = await axios.default.post(`https://discordapp.com/api/webhooks/${webhookId}/${webhookKey}`, payload);
            if (!this.isSuccess(response)) {
                console.log('Request failed [text]: ', response.statusText);
                console.log('Request failed [data]: ', response.data);
                this.tl.setResult(this.tl.TaskResult.Failed, `${JSON.stringify(response)}`);
                return false;
            }
            this.tl.setResult(this.tl.TaskResult.Succeeded, 'webhook message successful');
            return true;
        }
        catch (err) {
            this.tl.setResult(this.tl.TaskResult.Failed, JSON.stringify(err));
            return false;
        }
    }
}
exports.AzureTask = AzureTask;
