export class CircuitBreakerError extends Error {
    constructor() {
        super('Circuit is opened');
    }
}