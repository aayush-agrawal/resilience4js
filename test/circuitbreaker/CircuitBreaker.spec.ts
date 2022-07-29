import {BreakerState, CircuitBreaker} from "../../src/circuitbreaker/CircuitBreaker";
import {Decorators} from "../../src/Decorators";
import {CircuitBreakerError} from "../../src/circuitbreaker/error/CircuitBreakerError";

const successAsync = (res: unknown = 'default', delay = 1) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(res);
        }, delay);
    });
};

const failureAsync = (res: unknown = 'default', delay = 1) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(res);
        }, delay);
    });
};

const delay =  async (ms = 1): Promise<void> =>{
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

describe('Sliding Count Breaker', () => {

    it('switch to Open when failure rate exceeded', async () => {
        const circuitBreaker = new CircuitBreaker({
            windowSize: 100,
            minimumNumberOfRequests: 2,
            failureRateThreshold: 60,
            openStateDuration: 20
        });

        await expect(Decorators.of(successAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).resolves.toEqual('dummy');
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
        expect(circuitBreaker.getState()).toEqual(BreakerState.CLOSED);
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
        expect(circuitBreaker.getState()).toEqual(BreakerState.OPENED);
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toBeInstanceOf(CircuitBreakerError);
    });

    it('Half Open State switch to Closed/Opened', async () => {
        const circuitBreaker = new CircuitBreaker({
            windowSize: 100,
            minimumNumberOfRequests: 2,
            failureRateThreshold: 60,
            openStateDuration: 20
        });

        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
        expect(circuitBreaker.getState()).toEqual(BreakerState.OPENED);
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toBeInstanceOf(CircuitBreakerError);

        await delay(20);
        expect(circuitBreaker.getState()).toEqual(BreakerState.HALF_OPENED);

        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
        expect(circuitBreaker.getState()).toEqual(BreakerState.OPENED);
        await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toBeInstanceOf(CircuitBreakerError);

        await delay(20);
        expect(circuitBreaker.getState()).toEqual(BreakerState.HALF_OPENED);

        await expect(Decorators.of(successAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).resolves.toEqual('dummy');
        expect(circuitBreaker.getState()).toEqual(BreakerState.CLOSED);
        await expect(Decorators.of(successAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).resolves.toEqual('dummy');
    });

    it('Stay in closed state when the failure rate exceeds across the window', async () => {
        const circuitBreaker = new CircuitBreaker({
            windowSize: 20,
            minimumNumberOfRequests: 2,
            failureRateThreshold: 60,
            openStateDuration: 20
        });


        for(let i=0; i <= 10; i++) {
            await expect(Decorators.of(failureAsync, "dummy").withCircuitBreaker(circuitBreaker).execute()).rejects.toEqual('dummy');
            expect(circuitBreaker.getState()).toEqual(BreakerState.CLOSED);
            await delay(20);
        }
    });

});