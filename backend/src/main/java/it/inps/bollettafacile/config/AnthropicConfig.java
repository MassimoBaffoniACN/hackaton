package it.inps.bollettafacile.config;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * In profilo {@code mock} questo bean non viene creato: la catena mock non contatta Claude,
 * quindi non è richiesta alcuna credenziale (una API key fittizia o assente va bene).
 */
@Configuration
@Profile("!mock")
public class AnthropicConfig {

    /**
     * Client Anthropic condiviso. {@code fromEnv()} legge la credenziale da ANTHROPIC_API_KEY
     * (o dal profilo OAuth configurato con la CLI {@code ant}).
     */
    @Bean
    public AnthropicClient anthropicClient() {
        return AnthropicOkHttpClient.fromEnv();
    }
}
