export interface CircuitBreakerConfig {
    windowSize: number;
    failureRateThreshold: number;
    minimumNumberOfRequests: number;
    openStateDuration: number;
}

export class CircuitBreakerConfigBuilder {

    private static readonly WINDOW_SIZE: number = 60_000;
    private static readonly FAILURE_RATE_THRESHOLD: number = 50;
    private static readonly MINIMUM_NUMBER_OF_REQUESTS: number = 10;
    private static readonly OPEN_STATE_DURATION: number = 2_000;

    private readonly circuitBreakerConfig: CircuitBreakerConfig;

    constructor ( ) {
        this.circuitBreakerConfig = {
            windowSize: CircuitBreakerConfigBuilder.WINDOW_SIZE,
            failureRateThreshold: CircuitBreakerConfigBuilder.FAILURE_RATE_THRESHOLD,
            minimumNumberOfRequests: CircuitBreakerConfigBuilder.MINIMUM_NUMBER_OF_REQUESTS,
            openStateDuration: CircuitBreakerConfigBuilder.OPEN_STATE_DURATION,
        };
    }

    public windowSize (windowSize: number) {
        this.circuitBreakerConfig.windowSize = windowSize;
        return this;
    }

    public failureRateThreshold (failureRateThreshold: number) {
        this.circuitBreakerConfig.failureRateThreshold = failureRateThreshold;
        return this;
    }

    public minimumNumberOfRequests (minimumNumberOfRequests: number) {
        this.circuitBreakerConfig.minimumNumberOfRequests = minimumNumberOfRequests;
        return this;
    }

    public openStateDuration (openStateDuration: number) {
        this.circuitBreakerConfig.openStateDuration = openStateDuration;
        return this;
    }

    build(): CircuitBreakerConfig {
        return this.circuitBreakerConfig
    }
}