import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

// Navigazione tra step gestita internamente con signal (currentStep in App).
// Non si usa il router Angular: nessuna route, nessun RouterOutlet.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
  ]
};
