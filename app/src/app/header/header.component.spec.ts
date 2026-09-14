import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';

@Component({
  template: `<app-header [mostraNuovaBolletta]="mostra" (nuovaBollettino)="chiamata = true" />`,
  imports: [HeaderComponent],
})
class HostComponent {
  mostra = false;
  chiamata = false;
}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('crea il componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra logo e titolo', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(img?.alt).toBe('Bolletta Facile');
    expect(h1?.textContent?.trim()).toBe('Bolletta Facile');
  });

  it('nasconde il bottone quando mostraNuovaBolletta è false', () => {
    expect(fixture.nativeElement.querySelector('p-button')).toBeNull();
  });

  it('mostra il bottone e emette evento al click', async () => {
    fixture.componentInstance.mostra = true;
    fixture.detectChanges();
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('p-button');
    expect(btn).toBeTruthy();
    btn.click();
    expect(fixture.componentInstance.chiamata).toBe(true);
  });
});
