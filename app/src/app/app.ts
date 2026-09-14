import { Component, signal } from '@angular/core';
import { UploaderComponent } from './uploader/uploader.component';
import { ResultsComponent } from './results/results.component';
import { HeaderComponent } from './header/header.component';
import { SkipLinkComponent } from './skip-link/skip-link.component';

@Component({
  selector: 'app-root',
  imports: [SkipLinkComponent, HeaderComponent, UploaderComponent, ResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentStep = signal(1);

  protected onFileSelezionato(_file: File): void {
    this.currentStep.set(2);
  }

  protected onNuovaBolletta(): void {
    this.currentStep.set(1);
  }
}
