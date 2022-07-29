export interface TimeoutConfig {
    duration: number;
}

export class TimeoutConfigBuilder {

    private static readonly TIMEOUT_DURATION: number = 2_000;

    private readonly timeoutConfig: TimeoutConfig;

    constructor ( ) {
        this.timeoutConfig = {
            duration: TimeoutConfigBuilder.TIMEOUT_DURATION
        };
    }

    public duration (timeout_duration: number) {
        this.timeoutConfig.duration = timeout_duration;
        return this;
    }

    build(): TimeoutConfig {
        return this.timeoutConfig
    }
}