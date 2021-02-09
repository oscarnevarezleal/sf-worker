import {TaskWithInput} from "./worker";

export interface InputEvent {
    name?: string
}

export interface ITaskEventHandler<E extends InputEvent> {
    // on(event: string, listener: (event: E) => void): this;
    handle(event: TaskWithInput<E>): string | object;
}

export abstract class TaskHandler<E extends InputEvent> implements ITaskEventHandler<E> {
    // on(event: string, listener: (event: E) => void): this {}
    abstract handle(task: TaskWithInput<E>): string | object
}

