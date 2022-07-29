import {Timeout} from "./timeout/Timeout";
import {DecoratePromise, Decorators, PromiseFunction} from "./Decorators";
import {CircuitBreaker} from "./circuitbreaker/CircuitBreaker";
import {CircuitBreakerConfigBuilder} from "./circuitbreaker/CircuitBreakerConfig";

const delay = async (ms: number) => new Promise( resolve => setTimeout(resolve, ms) )

let timeout: Timeout = new Timeout({ duration: 1000 } );

let circuitBreaker = new CircuitBreaker(
    new CircuitBreakerConfigBuilder()
        .minimumNumberOfRequests(3)
        .openStateDuration(2000)
        .build()
);

const promise: PromiseFunction<number> = (param1 ) => Promise.resolve(param1 * 10);
const promiseWithTimeout: PromiseFunction<number> = (param1 ) => new Promise(resolve => {
    setTimeout( () => resolve(param1 * 10), 2000);
});
const promiseWithRejection: PromiseFunction<number> = ( ) => Promise.reject("Failure occurred");


const testTimeout = async <T> () => {
    try {
        const res = await Decorators
            .of( promise, [10])
            .withTimeout(timeout)
            .withCircuitBreaker(circuitBreaker)
            .execute()
        console.log(res);
    } catch (e) {
        console.log(e);
    }

    try {
        const res = await Decorators
            .of( promiseWithTimeout, [10])
            .withTimeout(timeout)
            .execute()
        console.log(res);
    } catch (e) {
        console.log(e);
    }
}


const callExecute = async ( times: number ) => {
    for( let i = 1; i <= times; i++) {
        try {
            let res = await breakerDecorator.execute();
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    }
}

const breakerDecorator = Decorators.of( promiseWithRejection, [10])
    .withCircuitBreaker(circuitBreaker);

const testBreaker = async () => {
// open breaker
    await callExecute(3)

// circuit is opened
    await callExecute(1)

// create a delay
    await delay(2100)

// make a fail call
    await callExecute(2)

// create a delay
    await delay(2100)

// success call
    await callExecute(1)
}

testTimeout();
testBreaker();
