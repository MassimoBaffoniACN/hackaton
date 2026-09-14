package it.inps.bollettafacile.service;

import com.fasterxml.jackson.databind.JsonNode;
import it.inps.bollettafacile.support.JsonExtractor;
import it.inps.bollettafacile.web.dto.AnalisiResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Implementazione REALE: orchestra la catena di agenti reader -> explainer via Claude.
 * Attiva in tutti i profili tranne {@code mock}.
 */
@Service
@Profile("!mock")
public class BollettaAnalysisService implements BollettaAnalyzer {

    private final BollettaReaderService reader;
    private final BollettaExplainerService explainer;
    private final JsonExtractor jsonExtractor;

    public BollettaAnalysisService(BollettaReaderService reader,
                                   BollettaExplainerService explainer,
                                   JsonExtractor jsonExtractor) {
        this.reader = reader;
        this.explainer = explainer;
        this.jsonExtractor = jsonExtractor;
    }

    @Override
    public AnalisiResponse analizza(MultipartFile bill) throws IOException {
        // Step 1 — estrazione strutturata (reader)
        String readerRaw = reader.extract(bill);
        String readerCleaned = jsonExtractor.stripFences(readerRaw);
        JsonNode analisi = jsonExtractor.tryParse(readerCleaned);
        // Se il JSON del reader non è parsabile, lo restituiamo come stringa grezza per non perdere l'output.
        String analisiRaw = (analisi == null) ? readerCleaned : null;

        // Step 2 — spiegazione + informazioni principali (explainer), a partire dal JSON del reader
        String explainerRaw = explainer.explain(readerCleaned);
        String explainerCleaned = jsonExtractor.stripFences(explainerRaw);
        JsonNode explainerNode = jsonExtractor.tryParse(explainerCleaned);

        String spiegazione;
        JsonNode informazioniPrincipali;
        if (explainerNode != null && explainerNode.hasNonNull("spiegazione")) {
            spiegazione = explainerNode.get("spiegazione").asText();
            informazioniPrincipali = explainerNode.has("informazioniPrincipali")
                    ? explainerNode.get("informazioniPrincipali")
                    : null;
        } else {
            // Fallback: l'explainer non ha prodotto JSON valido → usa il testo grezzo come spiegazione.
            spiegazione = explainerCleaned;
            informazioniPrincipali = null;
        }

        return new AnalisiResponse(analisi, analisiRaw, spiegazione, informazioniPrincipali);
    }
}
