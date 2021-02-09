import {InputEvent, Poller, TaskHandler, TaskWithInput, Worker} from "../src";

const ACTIVITY_ARN: string = 'arn:aws:states:us-east-1:048548734984:activity:MyActivity';
const REGION: string = 'us-east-1';

interface MyCustomEvent extends InputEvent {
}

(async function () {

    const activityArn: string = ACTIVITY_ARN

    class TestHandler extends TaskHandler<MyCustomEvent> {
        handle(task: TaskWithInput<MyCustomEvent>): string | object {
            // Process Task
            return 'OK';
        }
    }

    let handler = new TestHandler();

    const worker: Worker<MyCustomEvent> = new Worker<MyCustomEvent>({
        activityArn,
        eventType: undefined,
        region: REGION,
        handler
    });

    const poller: Poller = new Poller({
        activityArn
    }, worker);

    poller.start();

})();
