import {CircuitBreakerConfig, CircuitBreakerConfigBuilder} from "./CircuitBreakerConfig";

export class CircuitBreakerRegistry {
    private static readonly registry = new Map<string, CircuitBreakerConfig>;

    public static ofDefaults(): CircuitBreakerConfig {
        let circuitBreakerConfig = CircuitBreakerRegistry.registry.get("default");
        if(!circuitBreakerConfig) {
            circuitBreakerConfig = new CircuitBreakerConfigBuilder().build()
            CircuitBreakerRegistry.registry.set("default", circuitBreakerConfig);
        }
        return circuitBreakerConfig;
    }

    public static of(name: string, config: CircuitBreakerConfig): CircuitBreakerConfig {
        let circuitBreakerConfig = CircuitBreakerRegistry.registry.get(name);
        if(!circuitBreakerConfig) {
            circuitBreakerConfig = config;
            CircuitBreakerRegistry.registry.set(name, circuitBreakerConfig);
        }
        return circuitBreakerConfig;
    }
}