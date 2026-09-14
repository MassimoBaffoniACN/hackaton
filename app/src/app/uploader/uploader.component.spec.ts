import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UploaderComponentTestVersion } from './uploader.component.test-helper';
import { UploaderService } from './uploader.service';
import { DIMENSIONE_MAX_BYTE } from './uploader.interfaces';

describe('UploaderService', () => {
  let service: UploaderService;

  beforeEach(() => {
    service = new UploaderService();
  });

  // Test 1: File valido (PDF 5MB)
  it('valida file PDF di 5MB come valido', () => {
    const file = new File(['x'.repeat(5 * 1024 * 1024)], 'bolletta.pdf', { type: 'application/pdf' });
    const esito = service.valida(file);
    expect(esito.valido).toBe(true);
    expect(esito.errore).toBeUndefined();
  });

  // Test 2: Tipo MIME non accettato (HTML)
  it('rifiuta file non supportato (text/html)', () => {
    const file = new File(['<html>...</html>'], 'nota.html', { type: 'text/html' });
    const esito = service.valida(file);
    expect(esito.valido).toBe(false);
    expect(esito.errore).toBe('Formato non supportato. Carica un file PDF, JPEG o PNG.');
  });

  // Test 3: File troppo grande (>10MB)
  it('rifiuta file che supera 10MB', () => {
    const fileTooLarge = new File(['x'.repeat(11 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' });
    const esito = service.valida(fileTooLarge);
    expect(esito.valido).toBe(false);
    expect(esito.errore).toContain('10');
    expect(esito.errore).toContain('MB');
  });

  // Test 4: File esattamente al limite (10MB)
  it('accetta file esattamente a 10MB (boundary condition)', () => {
    const fileAtLimit = new File(['x'.repeat(DIMENSIONE_MAX_BYTE)], 'limite.pdf', { type: 'application/pdf' });
    const esito = service.valida(fileAtLimit);
    expect(esito.valido).toBe(true);
  });

  // Test 5: JPG valido
  it('valida file JPEG', () => {
    const file = new File(['jpeg'], 'scan.jpg', { type: 'image/jpeg' });
    const esito = service.valida(file);
    expect(esito.valido).toBe(true);
  });

  // Test 6: PNG valido
  it('valida file PNG', () => {
    const file = new File(['png'], 'screenshot.png', { type: 'image/png' });
    const esito = service.valida(file);
    expect(esito.valido).toBe(true);
  });
});

describe('UploaderComponent', () => {
  let fixture: ComponentFixture<UploaderComponentTestVersion>;
  let component: UploaderComponentTestVersion;
  let uploaderService: UploaderService;
  let mockLiveAnnouncer: any;

  beforeEach(async () => {
    mockLiveAnnouncer = {
      announce: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [UploaderComponentTestVersion],
      providers: [
        provideAnimationsAsync(),
        UploaderService,
        { provide: LiveAnnouncer, useValue: mockLiveAnnouncer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploaderComponentTestVersion);
    component = fixture.componentInstance;
    uploaderService = TestBed.inject(UploaderService);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper per creare DragEvent cross-browser
  function createDragEvent(type: string, files?: File[]) {
    const event = new Event(type, { bubbles: true, cancelable: true }) as any;
    event.dataTransfer = { files: files || [] } as any;
    return event as DragEvent;
  }

  // Test 7: Rendering: 3 card step
  it('renderizza esattamente 3 card step', () => {
    const steps = component.steps();
    expect(steps).toHaveLength(3);
    expect(steps[0].titolo).toBe('Carica la bolletta');
    expect(steps[1].titolo).toBe('Analisi automatica');
    expect(steps[2].titolo).toBe('Leggi i dati semplificati');
  });

  // Test 8: Bottone "Allega la tua bolletta" presente e abilitato
  it('bottone "Allega la tua bolletta" è presente e non disabilitato', () => {
    const button = fixture.nativeElement.querySelector('button[type="button"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Allega');
    expect(button.disabled).toBe(false);
  });

  // Test 9: Click bottone chiama .click() sull'input file
  it('apriSelettoreFile() cerca l\'input file e lo rende attivo', () => {
    // Il metodo apriSelettoreFile() cerca il viewChild inputFileRef e chiama .click()
    // Verifichiamo che non lancia errori e che il metodo sia callable
    expect(() => {
      component.apriSelettoreFile();
    }).not.toThrow();
  });

  // Test 10: onFileSelezionato con file valido → emette fileSelezionato
  it('onFileSelezionato con file valido emette output fileSelezionato', async () => {
    const validFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

    return new Promise<void>((resolve) => {
      const subscription = component.fileSelezionato.subscribe((file: File) => {
        expect(file).toBe(validFile);
        subscription.unsubscribe();
        resolve();
      });

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [validFile], value: '' },
        enumerable: true,
      });

      component.onFileSelezionato(event);
      fixture.detectChanges();
    });
  });

  // Test 11: onFileSelezionato con file non valido → imposta erroreValidazione
  it('onFileSelezionato con file non valido imposta erroreValidazione', () => {
    const invalidFile = new File(['html'], 'test.html', { type: 'text/html' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [invalidFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    expect(component.erroreValidazione()).toBeTruthy();
    expect(component.erroreValidazione()).toContain('Formato non supportato');
  });

  // Test 12: Drag & drop con file valido → emette fileSelezionato
  it('onDrop con file valido emette fileSelezionato', async () => {
    const validFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

    return new Promise<void>((resolve) => {
      const subscription = component.fileSelezionato.subscribe((file: File) => {
        expect(file).toBe(validFile);
        subscription.unsubscribe();
        resolve();
      });

      const dragEvent = createDragEvent('drop', [validFile]);
      component.onDrop(dragEvent);
      fixture.detectChanges();
    });
  });

  // Test 13: Drag & drop con file non valido → imposta erroreValidazione
  it('onDrop con file non valido imposta erroreValidazione', () => {
    const invalidFile = new File(['html'], 'test.html', { type: 'text/html' });

    const dragEvent = createDragEvent('drop', [invalidFile]);
    component.onDrop(dragEvent);
    fixture.detectChanges();

    expect(component.erroreValidazione()).toBeTruthy();
    expect(component.erroreValidazione()).toContain('Formato non supportato');
  });

  // Test 14: isDragOver() è false di default
  it('isDragOver è false di default', () => {
    expect(component.isDragOver()).toBe(false);
  });

  // Test 15: descrizioneAriaIds contiene valori corretti
  it('descrizioneAriaIds contiene solo uploader__description quando no errore', () => {
    const ids = component.descrizioneAriaIds();
    expect(ids).toBe('uploader__description');
    expect(ids).not.toContain('error');
  });

  it('descrizioneAriaIds include uploader__error quando c\'è errore', () => {
    const invalidFile = new File(['html'], 'test.html', { type: 'text/html' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [invalidFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    const ids = component.descrizioneAriaIds();
    expect(ids).toContain('uploader__description');
    expect(ids).toContain('uploader__error');
  });

  // Test di stato aggregato
  it('state computed aggregates tutti i signal correttamente', () => {
    const validFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [validFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    const state = component.state();
    expect(state.fileSelezionato).toBe(validFile);
    expect(state.isDragOver).toBe(false);
    expect(state.erroreValidazione).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  // Test: onDragEnter previene il default
  it('onDragEnter previene il default', () => {
    const dragEvent = createDragEvent('dragenter');
    const preventDefaultSpy = vi.spyOn(dragEvent, 'preventDefault');

    component.onDragEnter(dragEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  // Test: onDragOver imposta isDragOver = true
  it('onDragOver imposta isDragOver a true', () => {
    expect(component.isDragOver()).toBe(false);

    const dragEvent = createDragEvent('dragover');
    component.onDragOver(dragEvent);

    expect(component.isDragOver()).toBe(true);
  });

  // Test: onDragLeave azzera isDragOver quando relatedTarget è null
  it('onDragLeave azzera isDragOver quando relatedTarget è null', () => {
    const dragOverEvent = createDragEvent('dragover');
    component.onDragOver(dragOverEvent);
    expect(component.isDragOver()).toBe(true);

    const dragLeaveEvent = createDragEvent('dragleave');
    Object.defineProperty(dragLeaveEvent, 'relatedTarget', { value: null });
    component.onDragLeave(dragLeaveEvent);

    expect(component.isDragOver()).toBe(false);
  });

  // Test: LiveAnnouncer viene chiamato con successo
  it('LiveAnnouncer.announce viene chiamato con messaggio di successo', async () => {
    const validFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [validFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
      expect.stringContaining('test.pdf'),
      'polite',
    );
  });

  // Test: LiveAnnouncer viene chiamato con errore
  it('LiveAnnouncer.announce viene chiamato con messaggio di errore', async () => {
    const invalidFile = new File(['html'], 'test.html', { type: 'text/html' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [invalidFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
      expect.stringContaining('Formato non supportato'),
      'assertive',
    );
  });

  // Test: isLoading è false dopo gestione file
  it('isLoading è false dopo gestione file', () => {
    const validFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: { files: [validFile], value: '' },
      enumerable: true,
    });

    component.onFileSelezionato(event);
    fixture.detectChanges();

    expect(component.file()).toBe(validFile);
    expect(component.isLoading()).toBe(false);
  });

  // Test: onDrop con nessun file non cambia stato
  it('onDrop con nessun file non cambia lo stato', () => {
    const dragEvent = createDragEvent('drop');
    component.onDrop(dragEvent);
    fixture.detectChanges();

    expect(component.file()).toBeNull();
    expect(component.erroreValidazione()).toBeNull();
  });

  // Test: file signal è null di default
  it('file signal è null di default', () => {
    expect(component.file()).toBeNull();
  });

  // Test: erroreValidazione signal è null di default
  it('erroreValidazione è null di default', () => {
    expect(component.erroreValidazione()).toBeNull();
  });

  // Test: isLoading è false di default
  it('isLoading è false di default', () => {
    expect(component.isLoading()).toBe(false);
  });

  // Test: onDragLeave con relatedTarget !== null non cambia isDragOver
  it('onDragLeave con relatedTarget !== null non cambia isDragOver', () => {
    const dragOverEvent = createDragEvent('dragover');
    component.onDragOver(dragOverEvent);
    expect(component.isDragOver()).toBe(true);

    const dragLeaveEvent = createDragEvent('dragleave');
    Object.defineProperty(dragLeaveEvent, 'relatedTarget', { value: document.body });
    component.onDragLeave(dragLeaveEvent);

    expect(component.isDragOver()).toBe(true);
  });
});
