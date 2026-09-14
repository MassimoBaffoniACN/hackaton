package it.inps.bollettafacile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BollettaFacileApplication {

    public static void main(String[] args) {
        SpringApplication.run(BollettaFacileApplication.class, args);
    }
}
