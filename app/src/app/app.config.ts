import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Navigazione tra step gestita internamente con signal (currentStep in App).
// Non si usa il router Angular: nessuna route, nessun RouterOutlet.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    // Necessario per chiamare il backend che esegue la catena bolletta-reader → bolletta-explainer
    provideHttpClient(withFetch()),
    // Richiesto da PrimeNG 21 per le animazioni dei componenti
   
  ]
};
