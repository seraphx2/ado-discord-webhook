"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
let request = require('request');
//import { Newline } from './utility/newline';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channelId = String(tl.getInput('channelId', true));
            const webhookKey = String(tl.getInput('webhookKey', true));
            const name = tl.getInput('name');
            const avatar = tl.getInput('avatar');
            const messageType = String(tl.getInput('messageType', true));
            const content = String(tl.getInput('content'));
            const embeds = String(tl.getInput('embeds'));
            var payload = {};
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
            }, function (error, response, body) {
                if (response.statusCode !== 204)
                    tl.setResult(tl.TaskResult.Failed, `${JSON.stringify(response)}`);
                else
                    tl.setResult(tl.TaskResult.Succeeded, 'webhook message successful');
            });
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
