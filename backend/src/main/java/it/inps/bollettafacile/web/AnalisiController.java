package it.inps.bollettafacile.web;

import it.inps.bollettafacile.service.BollettaAnalyzer;
import it.inps.bollettafacile.web.dto.AnalisiResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api")
public class AnalisiController {

    private final BollettaAnalyzer analyzer;

    public AnalisiController(BollettaAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    /**
     * Analizza una bolletta (PDF o immagine) ed esegue la catena reader -> explainer.
     *
     * @param file la bolletta caricata (campo multipart "file")
     * @return JSON strutturato + spiegazione in linguaggio semplice
     */
    @PostMapping(value = "/analizza", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnalisiResponse analizza(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Nessun file bolletta ricevuto.");
        }
        return analyzer.analizza(file);
    }
}
