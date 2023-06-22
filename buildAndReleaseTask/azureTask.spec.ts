import {AzureTask, Inputs, postProcessRawEmbeds, UpdateMessageMode} from "./azureTask";
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
        const inputs: Inputs = new Inputs();
        inputs.webhookId = testCredentials.webhookId;
        inputs.webhookKey = testCredentials.webhookKey;
        inputs.content = 'Test <@' + testCredentials.mentionUserId + '>';
        inputs.name = 'Azure DevOps TEST';
        inputs.avatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y';
        inputs.embeds = postProcessRawEmbeds(testEmbed);

        const createTask = new AzureTask(inputs);
        let success = await createTask.run();
        expect(success).toBe(true);//, 'should have succeeded');

        await wait(2000);

        inputs.updateMessageMode = UpdateMessageMode.edit;
        inputs.content = 'Test <@' + testCredentials.mentionUserId + '> EDITED';
        const editTask = new AzureTask(inputs);
        success = await editTask.run();
        expect(success).toBe(true);//, 'should have succeeded');

        await wait(2000);

        inputs.updateMessageMode = UpdateMessageMode.replace;
        inputs.content = 'Test <@' + testCredentials.mentionUserId + '> REPLACED';
        const replaceTask = new AzureTask(inputs);
        success = await replaceTask.run();
        expect(success).toBe(true);//, 'should have succeeded');

    }, 10000);

    it('should fail with invalid webhookId and webhookKey', async () => {
        const inputs: Inputs = new Inputs();
        inputs.webhookId = 'invalid_channel';
        inputs.webhookKey = 'invalid_webhook';

        const task = new AzureTask(inputs);
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


export async function wait(timeInMilliseconds?: number): Promise<void> {
    return await new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}
