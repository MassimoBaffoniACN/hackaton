package it.inps.bollettafacile.prompt;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Carica (una sola volta, poi da cache) i system prompt della catena di agenti
 * dai file in {@code src/main/resources/prompts/}.
 */
@Component
public class PromptLoader {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    /** @param name nome del file senza percorso, es. "bolletta-reader.txt" */
    public String load(String name) {
        return cache.computeIfAbsent(name, this::readResource);
    }

    private String readResource(String name) {
        ClassPathResource resource = new ClassPathResource("prompts/" + name);
        try (var in = resource.getInputStream()) {
            return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossibile caricare il prompt: " + name, e);
        }
    }
}
