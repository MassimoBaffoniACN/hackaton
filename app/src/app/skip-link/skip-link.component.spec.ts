import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkipLinkComponent } from './skip-link.component';

describe('SkipLinkComponent', () => {
  let fixture: ComponentFixture<SkipLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLinkComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SkipLinkComponent);
    fixture.detectChanges();
  });

  it('crea il componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ha il link a #main con testo corretto', () => {
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a.skip-link');
    expect(a?.getAttribute('href')).toBe('#main');
    expect(a?.textContent?.trim()).toBe('Vai al contenuto principale');
  });
});
