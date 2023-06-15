"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azureTask_1 = require("./azureTask");
const azureTask = new azureTask_1.AzureTask();
azureTask.run()
    .then(x => 'run completed')
    .catch(x => 'run failed');
