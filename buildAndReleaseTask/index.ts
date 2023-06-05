import {AzureTask} from "./azureTask";


const azureTask = new AzureTask();
azureTask.run()
    .then(x => 'run completed')
    .catch(x => 'run failed');
