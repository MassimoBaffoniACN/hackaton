package it.inps.bollettafacile.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.inps.bollettafacile.web.dto.AnalisiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Locale;

/**
 * Implementazione MOCK: non contatta Claude e non richiede alcuna API key.
 * Restituisce dati di esempio caricati da {@code resources/mock/samples.json}.
 * Attiva solo con profilo {@code mock}.
 *
 * <p>Comportamento (opzione B): se il nome del file caricato contiene una delle parole chiave {@code match}
 * di un campione, ritorna quel campione; altrimenti ritorna il campione marcato {@code default}.</p>
 */
@Service
@Profile("mock")
public class MockBollettaAnalyzer implements BollettaAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(MockBollettaAnalyzer.class);

    private final List<MockSample> samples;

    public MockBollettaAnalyzer() {
        this.samples = loadSamples();
        log.warn("MOCK MODE attivo: le analisi sono dati di esempio, Claude NON viene chiamato.");
    }

    @Override
    public AnalisiResponse analizza(MultipartFile bill) {
        String filename = bill.getOriginalFilename() == null
                ? ""
                : bill.getOriginalFilename().toLowerCase(Locale.ROOT);

        MockSample chosen = samples.stream()
                .filter(s -> s.match() != null && s.match().stream()
                        .anyMatch(k -> !k.isBlank() && filename.contains(k.toLowerCase(Locale.ROOT))))
                .findFirst()
                .orElseGet(this::defaultSample);

        log.info("MOCK: file '{}' -> campione '{}'", filename, chosen.match());
        return new AnalisiResponse(chosen.analisi(), null, chosen.spiegazione(), chosen.informazioniPrincipali());
    }

    private MockSample defaultSample() {
        return samples.stream()
                .filter(MockSample::isDefault)
                .findFirst()
                .orElse(samples.get(0));
    }

    private List<MockSample> loadSamples() {
        ObjectMapper mapper = new ObjectMapper();
        ClassPathResource resource = new ClassPathResource("mock/samples.json");
        try (var in = resource.getInputStream()) {
            return List.of(mapper.readValue(in, MockSample[].class));
        } catch (IOException e) {
            throw new UncheckedIOException("Impossibile caricare i campioni mock (mock/samples.json)", e);
        }
    }

    /** Un campione di risposta mock. */
    private record MockSample(
            List<String> match,
            boolean isDefault,
            JsonNode analisi,
            String spiegazione,
            JsonNode informazioniPrincipali
    ) {
    }
}
