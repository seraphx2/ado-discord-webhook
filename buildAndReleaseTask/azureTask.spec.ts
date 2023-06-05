import {AzureTask} from "./azureTask";
import * as fs from "fs";
const testCredentials: {
    webhookId: string,
    webhookKey: string,
    mentionUserId: string
} = JSON.parse(fs.readFileSync('test-credentials.json').toString());


function getVariableKey(name: string) {
    return name.replace(/\./g, '_').replace(/ /g, '_').toUpperCase();
}

function setInput(key: string, val: string) {
    process.env['INPUT_' + getVariableKey(key)] = val;
}

describe('Sample task tests', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules() // Most important - it clears the cache
        process.env = {...OLD_ENV}; // Make a copy
    });
    afterEach(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    it('should succeed with valid inputs', async () => {
        setInput('channelId', testCredentials.webhookId);
        setInput('webhookKey', testCredentials.webhookKey);
        setInput('content', 'Test <@' + testCredentials.mentionUserId + '>');
        setInput('name', 'Azure DevOps TEST');
        setInput('avatar', 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y');
        setInput('embeds', testEmbed);

        const task = new AzureTask();
        const success = await task.run();

        console.log('Succeeded:', success);
        expect(success).toBe(true);//, 'should have succeeded');
    });

    it('should fail with invalid channelId and webhookKey', async () => {
        setInput('channelId', 'invalid_channel');
        setInput('webhookKey', 'invalid_webhook');

        const task = new AzureTask();
        const success = await task.run();

        console.log('Succeeded:', success);
        expect(success).toBe(false);//, 'should have succeeded');
    });
});

const testEmbed =
    `[
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
    ]`;
