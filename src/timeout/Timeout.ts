import {PromiseFunction} from "../Decorators";
import {TimeoutConfig} from "./TimeoutConfig";
import {TimeoutError} from "./error/TimeoutError";

export class Timeout {

    private readonly config:TimeoutConfig;

    constructor(config: TimeoutConfig) {
        this.config = config;
    }

    execute<T> (promise: PromiseFunction<T>, params: any[]): Promise<T> {
        let time = this.config.duration;
        if(time === 0 || time === Infinity) {
            return promise(...params);
        }

        let timeout: ReturnType<typeof setTimeout>;
        return Promise.race([
            promise(...params),
            new Promise<T>((resolve, reject) => {
                timeout = setTimeout(() => {
                    reject(new TimeoutError());
                }, time);
            })
        ]).then( res => {
            clearTimeout(timeout);
            return res;
        }).catch(err => {
            clearTimeout(timeout)
            return Promise.reject(err);
        })
    }

    static decoratePromise<T>(timeout: Timeout, supplier: PromiseFunction<T>, params: any[]): PromiseFunction<T>{
        return () => timeout.execute(supplier, params);
    }
}