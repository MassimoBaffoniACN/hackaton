import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: { role: 'banner' },
})
export class HeaderComponent {
  readonly mostraNuovaBolletta = input<boolean>(false);
  readonly nuovaBollettino = output<void>();

  onNuovaBolletta(): void {
    this.nuovaBollettino.emit();
  }
}
