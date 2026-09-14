package it.inps.bollettafacile.service;

import it.inps.bollettafacile.web.dto.AnalisiResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Punto di ingresso della catena di analisi. Ha due implementazioni selezionate per profilo Spring:
 * <ul>
 *   <li>{@link BollettaAnalysisService} (profilo {@code !mock}) — chiama Claude (serve la API key);</li>
 *   <li>{@code MockBollettaAnalyzer} (profilo {@code mock}) — ritorna dati finti, nessuna key.</li>
 * </ul>
 * Il controller dipende da questa interfaccia e non sa quale implementazione è attiva.
 */
public interface BollettaAnalyzer {

    AnalisiResponse analizza(MultipartFile bill) throws IOException;
}
