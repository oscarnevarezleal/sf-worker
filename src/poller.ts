import {GetActivityTaskCommand, GetActivityTaskOutput} from "@aws-sdk/client-sfn";
import {Worker} from "./worker";

export enum STATUS {
    RUNNING,
    STOPPED
}

export interface PollerParams {
    id?: string
    startTime?: Date
    activityArn: string
    workerName?: string
}

export class Poller {
    private readonly id: string;

    get running(): boolean {
        return this._status == STATUS.RUNNING;
    }

    get stopped(): boolean {
        return this._status == STATUS.STOPPED;
    }

    private _status: STATUS = STATUS.STOPPED;

    constructor(private readonly params: PollerParams, private worker: Worker<any>) {
        this.id = params?.id || Math.random().toString().replace(/\./, '');
    }

    private stop = () => {
        this._status = STATUS.STOPPED
    };

    private restart = () => {
        this._status = STATUS.STOPPED
        this._status = STATUS.RUNNING
    };

    private async getActivityTask(): Promise<GetActivityTaskOutput> {
        const {activityArn} = this.params;
        const command: GetActivityTaskCommand = new GetActivityTaskCommand({
            activityArn
        });
        return await this.worker.sfnClient.send(command);
    }

    private async pool() {
        const {worker} = this;
        this._status = STATUS.RUNNING;
        console.log('Polling')
        const response: GetActivityTaskOutput = await this.getActivityTask();
        console.log('Poll returned, ', response)
        if (response.taskToken !== undefined && response.taskToken.length > 1) {
            if (response.input) {
                const {workerName} = this.params;
                const {taskToken} = response;
                const {id: poolerId} = this;
                console.log(`Pooler (${this.id}): Activity task received (${response.taskToken.slice(0, 10)})`);
                const params = {
                    taskToken,
                    input: JSON.parse(<string>response.input),
                    poolerId
                }
                // @ts-ignore
                await worker.handleTask(params);
                console.log('Poll again')
                await this.pool();
            } else {
                return null;
            }
        } else {
            return null;
        }

    }

    start() {
        if (this._status == STATUS.STOPPED) {
            this.pool()
        }

    }
}
