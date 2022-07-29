import {TimeoutConfig, TimeoutConfigBuilder} from "./TimeoutConfig";

export class TimeoutRegistry {
    private static readonly registry = new Map<string, TimeoutConfig>;

    public static ofDefaults(): TimeoutConfig {
        let timeoutConfig = TimeoutRegistry.registry.get("default");
        if(!timeoutConfig) {
            timeoutConfig = new TimeoutConfigBuilder().build()
            TimeoutRegistry.registry.set("default", timeoutConfig);
        }
        return timeoutConfig;
    }

    public static of(name: string, config: TimeoutConfig): TimeoutConfig {
        let timeoutConfig = TimeoutRegistry.registry.get(name);
        if(!timeoutConfig) {
            timeoutConfig = config;
            TimeoutRegistry.registry.set(name, timeoutConfig);
        }
        return timeoutConfig;
    }
}