package it.inps.bollettafacile.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Risposta dell'endpoint di analisi.
 *
 * @param analisi                JSON strutturato dei campi estratti dal reader (formato
 *                               {@code { valore, confidenza }}), oppure {@code null} se l'output del reader
 *                               non era JSON valido.
 * @param analisiRaw             output grezzo del reader, valorizzato solo quando {@code analisi} è null.
 * @param spiegazione            spiegazione in linguaggio semplice (markdown).
 * @param informazioniPrincipali riepilogo dei dati chiave (totale, scadenza, periodo, consumo, stato
 *                               pagamenti precedenti, se/come pagare, contatti, note), ciascuno con la
 *                               confidenza ereditata dal reader; {@code null} se non disponibile.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AnalisiResponse(
        JsonNode analisi,
        String analisiRaw,
        String spiegazione,
        JsonNode informazioniPrincipali
) {
}
