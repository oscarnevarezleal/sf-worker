import {SFNClient} from "@aws-sdk/client-sfn";
import {InputEvent, ITaskEventHandler, TaskHandler} from "./index";

export interface WorkerOptions<E extends InputEvent> {
    workerName?: string,
    activityArn: string,
    eventType: unknown,
    region: string,
    handler: ITaskEventHandler<E>
}

class BaseWorker<E extends InputEvent> {
    get sfnClient(): SFNClient {
        return this._sfnClient;
    }

    private readonly _sfnClient: SFNClient;
    private readonly options: WorkerOptions<any>;
    protected handler: TaskHandler<E>;

    constructor(options: WorkerOptions<any>) {
        this.options = options;
        let {region} = options;
        this._sfnClient = new SFNClient({region});
        this.handler = options.handler;
    }
}

export interface TaskWithInput<T> {
    taskToken: string,
    poolerId: string,
    input: T
}

export class Worker<E extends InputEvent> extends BaseWorker<E> {
    /**
     *
     * @param options
     */
    constructor(options: WorkerOptions<E>) {
        super(options);
    }

    async handleTask(task: TaskWithInput<E>) {
        const result: string | object = this.handler.handle(task);
        console.log('handleTask', result)
    }
}
