package it.inps.bollettafacile.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

/**
 * Estrae/pulisce il JSON prodotto dal reader: rimuove eventuali fence markdown
 * (```json ... ```) e tenta il parsing in un {@link JsonNode}.
 */
@Component
public class JsonExtractor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Rimuove i fence markdown e gli spazi attorno al JSON. */
    public String stripFences(String raw) {
        if (raw == null) {
            return "";
        }
        String text = raw.trim();
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            if (firstNewline >= 0) {
                text = text.substring(firstNewline + 1);
            }
            int closingFence = text.lastIndexOf("```");
            if (closingFence >= 0) {
                text = text.substring(0, closingFence);
            }
        }
        return text.trim();
    }

    /** Prova a fare il parsing del JSON; ritorna {@code null} se non è JSON valido. */
    public JsonNode tryParse(String cleaned) {
        try {
            return objectMapper.readTree(cleaned);
        } catch (Exception e) {
            return null;
        }
    }
}
