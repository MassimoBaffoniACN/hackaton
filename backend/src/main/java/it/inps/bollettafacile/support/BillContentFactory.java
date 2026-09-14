package it.inps.bollettafacile.support;

import com.anthropic.models.messages.Base64ImageSource;
import com.anthropic.models.messages.Base64PdfSource;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.DocumentBlockParam;
import com.anthropic.models.messages.ImageBlockParam;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Locale;

/**
 * Trasforma il file di una bolletta (PDF o immagine) nel content block da allegare
 * al messaggio utente della Messages API.
 */
@Component
public class BillContentFactory {

    /** Costruisce il blocco documento/immagine per la bolletta caricata. */
    public ContentBlockParam toContentBlock(MultipartFile file) throws IOException {
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        String ext = extension(file.getOriginalFilename());
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);

        if (contentType.contains("pdf") || "pdf".equals(ext)) {
            return ContentBlockParam.ofDocument(DocumentBlockParam.builder()
                    .source(Base64PdfSource.builder().data(base64).build())
                    .build());
        }

        Base64ImageSource.MediaType mediaType = imageMediaType(ext, contentType);
        return ContentBlockParam.ofImage(ImageBlockParam.builder()
                .source(Base64ImageSource.builder()
                        .mediaType(mediaType)
                        .data(base64)
                        .build())
                .build());
    }

    private Base64ImageSource.MediaType imageMediaType(String ext, String contentType) {
        String hint = contentType.isEmpty() ? ext : contentType;
        if (hint.contains("png")) {
            return Base64ImageSource.MediaType.IMAGE_PNG;
        }
        if (hint.contains("webp")) {
            return Base64ImageSource.MediaType.IMAGE_WEBP;
        }
        if (hint.contains("gif")) {
            return Base64ImageSource.MediaType.IMAGE_GIF;
        }
        // jpg / jpeg e default
        return Base64ImageSource.MediaType.IMAGE_JPEG;
    }

    private String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
