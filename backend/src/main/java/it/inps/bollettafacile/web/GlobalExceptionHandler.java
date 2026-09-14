package it.inps.bollettafacile.web;

import com.anthropic.errors.AnthropicServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Errori provenienti dall'API Claude (rate limit, credenziali, sovraccarico, ecc.). */
    @ExceptionHandler(AnthropicServiceException.class)
    public ProblemDetail handleAnthropic(AnthropicServiceException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_GATEWAY);
        problem.setTitle("Errore nel servizio di analisi");
        problem.setDetail("La chiamata al modello non è riuscita: " + ex.getMessage());
        return problem;
    }

    /** Errori di lettura del file caricato. */
    @ExceptionHandler(IOException.class)
    public ProblemDetail handleIo(IOException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("File non leggibile");
        problem.setDetail("Impossibile leggere il file della bolletta: " + ex.getMessage());
        return problem;
    }
}
