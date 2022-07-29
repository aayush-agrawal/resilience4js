/**
 * Breaker states.
 */
import {PromiseFunction} from "../Decorators";
import {CircuitBreakerConfig} from "./CircuitBreakerConfig";
import {CircuitBreakerError} from "./error/CircuitBreakerError";

export enum BreakerState {
    CLOSED = 'closed',
    HALF_OPENED = 'half-opened',
    OPENED = 'opened'
}

type BreakerResultResponse = {
    requestResult: SlidingWindowRequestResult;
    response: any;
};

export enum SlidingWindowRequestResult {
    SUCCESS =  0,
    FAILURE =  1
}

interface SlidingTimeElem {
    result: SlidingWindowRequestResult,
    timestamp: number
}


export class CircuitBreaker {

    private state: BreakerState;
    private config: CircuitBreakerConfig;
    private callsInClosedState: SlidingTimeElem[];

    constructor( config: CircuitBreakerConfig) {
        this.state = BreakerState.CLOSED;
        this.config = config;
        this.callsInClosedState = [];
    }

    public static decoratePromise<T> (breaker: CircuitBreaker, promise: PromiseFunction<T>, params: any[]) {
        return () => breaker.execute(promise, params);
    }

    public getState(): BreakerState {
        return this.state;
    }

    public async execute<T> (promise: PromiseFunction<T>, params: any[]): Promise<T> {
        switch (this.state) {
            case BreakerState.OPENED:
                return Promise.reject(new CircuitBreakerError());
            case BreakerState.HALF_OPENED:
                return this.executeInHalfOpened(promise, params);
            case BreakerState.CLOSED:
            default:
                return this.executeInClosed(promise, params);
        }
    }

    private async executeInClosed<T>(promise: PromiseFunction<T>, params: any[]) {
        const {requestResult, response } = await this.executePromise(promise, params);
        this.filterCalls();
        this.callsInClosedState.push({
            result: requestResult,
            timestamp: (new Date()).getTime()
        });

        if (this.callsInClosedState.length >= this.config.minimumNumberOfRequests && requestResult !== SlidingWindowRequestResult.SUCCESS) {
            const { nbFailure } = this.callsInClosedState.reduce(this.accumulateFailure, { nbFailure: 0});
            if ((this.config.failureRateThreshold < 100
                && (((nbFailure / this.callsInClosedState.length) * 100) >= this.config.failureRateThreshold))) {
                this.open();
            }
        }
        if (requestResult === SlidingWindowRequestResult.FAILURE) {
            return Promise.reject(response);
        } else {
            return Promise.resolve(response);
        }
    }

    private async executeInHalfOpened<T> (promise: PromiseFunction<T>, params: any[]): Promise<T> {
        const {requestResult, response } = await this.executePromise(promise, params);

        if (requestResult === SlidingWindowRequestResult.SUCCESS)
            this.close();
        if (requestResult === SlidingWindowRequestResult.FAILURE)
            this.open();
        if (requestResult === SlidingWindowRequestResult.FAILURE) {
            return Promise.reject(response);
        } else {
            return Promise.resolve(response);
        }

    }

    private async executePromise<T> (promise: PromiseFunction<T>, params: any[]): Promise<BreakerResultResponse> {
        return promise(...params)
            .then( response => {
                return { requestResult: SlidingWindowRequestResult.SUCCESS, response };
            })
            .catch( error => {
                return { requestResult: SlidingWindowRequestResult.FAILURE, response: error };
            });
    }

    private filterCalls(): void {
        let nbCalls = this.callsInClosedState.length;
        const now = (new Date()).getTime();
        for (let i=0; i<nbCalls; i++) {
            if ((now - this.callsInClosedState[0].timestamp) <= this.config.windowSize) {
                break;
            }
            this.callsInClosedState.shift();
        }
    }

    private accumulateFailure (acc: { nbFailure: number}, current: SlidingTimeElem): { nbFailure: number } {
        switch(current.result) {
            case SlidingWindowRequestResult.FAILURE:
                acc.nbFailure++;
                break;
        }
        return acc;
    }

    private open (): void {
        if (this.state !== BreakerState.OPENED) {
            this.state = BreakerState.OPENED;
            /*this.openTimeout = */setTimeout(() => {
                this.halfOpen();
            }, this.config.openStateDuration);
            this.reinitializeCounters();
        }
    }

    private halfOpen (): void {
        if (this.state !== BreakerState.HALF_OPENED) {
             this.state = BreakerState.HALF_OPENED;
            this.reinitializeCounters();
        }
    }

    private close (): void {
        if (this.state !== BreakerState.CLOSED) {
            this.state = BreakerState.CLOSED;
            this.reinitializeCounters();
        }
    }

    private reinitializeCounters (): void {
        this.callsInClosedState = [];
    }

}