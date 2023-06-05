"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tmrm = require("azure-pipelines-task-lib/mock-run");
const path = require("path");
let taskPath = path.join(__dirname, '..', 'index.js');
let tmr = new tmrm.TaskMockRunner(taskPath);
// https://discord.com/api/webhooks/1115268907842940938/Ew_XcnKE81i5Jv92vkbJxHF8SbKDCnxuhYTa2yTe6eXucnhQ5aJC0hHdzHctQrZSHKTD
tmr.setInput('channelId', '868097505328496651');
tmr.setInput('webhookKey', 'Ew_XcnKE81i5Jv92vkbJxHF8SbKDCnxuhYTa2yTe6eXucnhQ5aJC0hHdzHctQrZSHKTD');
// tmr.setInput('name',        '');
// tmr.setInput('avatar',      '');
tmr.setInput('content', 'Test <@172299537115774976>');
tmr.setInput('embeds', `[
    {
      "type": "rich",
      "title": \`title\`,
      "description": \`description\`,
      "color": 0xfff200,
      "fields": [
        {
          "name": \`name\`,
          "value": \`value\`,
          "inline": true
        }
      ],
      "timestamp": \`2023-06-05T13:14:01.000Z\`,
      "author": {
        "name": \`Yutamago\`,
        "url": \`https://www.google.de\`
      },
      "footer": {
        "text": \`footer\`
      },
      "url": \`https://www.google.de\`
    }
  ]`);
tmr.run();
