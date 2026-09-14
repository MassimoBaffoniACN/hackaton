package it.inps.bollettafacile.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import it.inps.bollettafacile.config.AnthropicProperties;
import it.inps.bollettafacile.prompt.PromptLoader;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Secondo anello della catena: trasforma il JSON del reader in una spiegazione
 * in linguaggio semplice per persone anziane o poco esperte.
 * Corrisponde all'agente {@code bolletta-explainer}. Non attivo in profilo {@code mock}.
 */
@Service
@Profile("!mock")
public class BollettaExplainerService {

    private final AnthropicClient client;
    private final AnthropicProperties properties;
    private final PromptLoader promptLoader;

    public BollettaExplainerService(AnthropicClient client,
                                    AnthropicProperties properties,
                                    PromptLoader promptLoader) {
        this.client = client;
        this.properties = properties;
        this.promptLoader = promptLoader;
    }

    /**
     * @param analisiJson il JSON prodotto dal reader.
     * @return un JSON con i campi {@code spiegazione} (markdown) e {@code informazioniPrincipali}.
     */
    public String explain(String analisiJson) {
        MessageCreateParams params = MessageCreateParams.builder()
                .model(properties.model())
                .maxTokens(properties.maxTokensExplainer())
                .outputConfig(OutputConfig.builder().effort(properties.effortLevel()).build())
                .system(promptLoader.load("bolletta-explainer.txt"))
                .addUserMessage("Ecco il JSON della bolletta da spiegare in linguaggio semplice:\n\n"
                        + analisiJson)
                .build();

        Message response = client.messages().create(params);
        return textOf(response);
    }

    private String textOf(Message response) {
        StringBuilder sb = new StringBuilder();
        response.content().forEach(block -> block.text().ifPresent(t -> sb.append(t.text())));
        return sb.toString();
    }
}
