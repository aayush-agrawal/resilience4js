export class TimeoutError extends Error {
    constructor() {
        super('Timed out');
    }
}