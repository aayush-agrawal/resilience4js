import {Timeout} from "./timeout/Timeout";
import {CircuitBreaker} from "./circuitbreaker/CircuitBreaker";

export type  PromiseFunction<T> = (...params: any[]) => Promise<T>;

export class Decorators {

    public static of<T> (func: PromiseFunction<T>, ...params: any[]): DecoratePromise<T> {
        return new DecoratePromise<T>(func, params)
    }

}

export class DecoratePromise<T> {
    private promise: PromiseFunction<T>;
    private readonly params: any[];

    constructor(supplier: PromiseFunction<T>, params: any[]) {
        this.promise = supplier;
        this.params = params;
    }

    public async execute():  Promise<T> {
        return this.promise(this.params);
    }

    public withTimeout (timeout: Timeout): DecoratePromise<T> {
        this.promise =  Timeout.decoratePromise(timeout, this.promise, this.params);
        return this;
    }

    public withCircuitBreaker (breaker: CircuitBreaker): DecoratePromise<T> {
        this.promise =  CircuitBreaker.decoratePromise(breaker, this.promise, this.params);
        return this;
    }
}
