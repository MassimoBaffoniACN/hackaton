package it.inps.bollettafacile.config;

import com.anthropic.models.messages.OutputConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Locale;

/**
 * Parametri della catena di agenti Claude, letti dal blocco {@code anthropic:} di application.yml.
 * La API key non è qui: l'SDK la legge dalla variabile d'ambiente ANTHROPIC_API_KEY.
 */
@ConfigurationProperties(prefix = "anthropic")
public record AnthropicProperties(
        String model,
        long maxTokensReader,
        long maxTokensExplainer,
        /** Livello di effort del modello: low | medium | high | xhigh | max. Basso = meno costo/latenza. */
        String effort
) {

    /** Converte la stringa {@link #effort()} nel livello dell'SDK; default LOW se assente/ignoto. */
    public OutputConfig.Effort effortLevel() {
        String e = (effort == null) ? "low" : effort.trim().toLowerCase(Locale.ROOT);
        return switch (e) {
            case "medium" -> OutputConfig.Effort.MEDIUM;
            case "high" -> OutputConfig.Effort.HIGH;
            case "xhigh" -> OutputConfig.Effort.XHIGH;
            case "max" -> OutputConfig.Effort.MAX;
            default -> OutputConfig.Effort.LOW;
        };
    }
}
