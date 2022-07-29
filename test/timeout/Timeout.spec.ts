import {Decorators, PromiseFunction} from "../../src/Decorators";
import {Timeout} from "../../src/timeout/Timeout";
import {TimeoutError} from "../../src/timeout/error/TimeoutError";

const successAsync = (res: string, delay: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(res);
        }, delay);
    });
};

describe('Timeout', () => {
    it('should not timeout the function', async () => {
        await expect(Decorators.of(successAsync, 'default', 2).withTimeout(new Timeout({ duration: 5 } )).execute()).resolves.toBe('default');
    });

    it('should timeout the function', async () => {
        await expect(Decorators.of(successAsync, 'default', 10).withTimeout(new Timeout({ duration: 5 } )).execute()).rejects.toBeInstanceOf(TimeoutError);
    });
});