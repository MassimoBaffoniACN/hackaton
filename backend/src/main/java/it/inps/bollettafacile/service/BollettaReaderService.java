package it.inps.bollettafacile.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import com.anthropic.models.messages.TextBlockParam;
import it.inps.bollettafacile.config.AnthropicProperties;
import it.inps.bollettafacile.prompt.PromptLoader;
import it.inps.bollettafacile.support.BillContentFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Primo anello della catena: legge la bolletta (PDF/immagine) ed estrae il JSON
 * strutturato con i campi nel formato {@code { valore, confidenza }}.
 * Corrisponde all'agente {@code bolletta-reader}. Non attivo in profilo {@code mock}.
 */
@Service
@Profile("!mock")
public class BollettaReaderService {

    private final AnthropicClient client;
    private final AnthropicProperties properties;
    private final PromptLoader promptLoader;
    private final BillContentFactory contentFactory;

    public BollettaReaderService(AnthropicClient client,
                                 AnthropicProperties properties,
                                 PromptLoader promptLoader,
                                 BillContentFactory contentFactory) {
        this.client = client;
        this.properties = properties;
        this.promptLoader = promptLoader;
        this.contentFactory = contentFactory;
    }

    /** @return il testo JSON prodotto dal modello (eventualmente con fence markdown). */
    public String extract(MultipartFile bill) throws IOException {
        ContentBlockParam billBlock = contentFactory.toContentBlock(bill);
        ContentBlockParam instruction = ContentBlockParam.ofText(TextBlockParam.builder()
                .text("Analizza la bolletta allegata ed estrai i dati nel JSON richiesto. "
                        + "Rispondi solo con il JSON.")
                .build());

        MessageCreateParams params = MessageCreateParams.builder()
                .model(properties.model())
                .maxTokens(properties.maxTokensReader())
                .outputConfig(OutputConfig.builder().effort(properties.effortLevel()).build())
                .system(promptLoader.load("bolletta-reader.txt"))
                .addUserMessageOfBlockParams(List.of(billBlock, instruction))
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
