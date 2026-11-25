import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TranslateService } from '@ngx-translate/core';

interface BrowserSpeechRecognitionResultEvent {
  readonly results: ArrayLike<ArrayLike<{ readonly transcript: string }>>;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { readonly error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export class VoicePermissionError extends Error {
  constructor() {
    super('Speech recognition permission denied');
  }
}

function browserRecognition(): BrowserSpeechRecognitionConstructor | undefined {
  const scope = window as unknown as Record<string, BrowserSpeechRecognitionConstructor | undefined>;
  return scope['SpeechRecognition'] ?? scope['webkitSpeechRecognition'];
}

@Injectable({ providedIn: 'root' })
export class VoiceInput {
  private readonly translate = inject(TranslateService);
  private readonly listeningState = signal(false);
  private browserSession?: BrowserSpeechRecognition;

  readonly listening = this.listeningState.asReadonly();
  readonly supported = Capacitor.isNativePlatform()
    ? Capacitor.isPluginAvailable('SpeechRecognition')
    : browserRecognition() !== undefined;

  async listen(): Promise<string | null> {
    if (this.listeningState()) {
      await this.stop();
      return null;
    }
    this.listeningState.set(true);
    try {
      return Capacitor.isNativePlatform() ? await this.listenNative() : await this.listenBrowser();
    } finally {
      this.listeningState.set(false);
      this.browserSession = undefined;
    }
  }

  async stop(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SpeechRecognition.stop();
    } else {
      this.browserSession?.stop();
    }
  }

  private get language(): string {
    return this.translate.instant('common.locale');
  }

  private async listenNative(): Promise<string | null> {
    const { available } = await SpeechRecognition.available();
    if (!available) {
      return null;
    }
    const { speechRecognition } = await SpeechRecognition.requestPermissions();
    if (speechRecognition !== 'granted') {
      throw new VoicePermissionError();
    }
    const { matches } = await SpeechRecognition.start({
      language: this.language,
      maxResults: 1,
      partialResults: false,
      popup: false,
    });
    return matches?.[0]?.trim() || null;
  }

  private listenBrowser(): Promise<string | null> {
    const Recognition = browserRecognition();
    if (!Recognition) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      const recognition = new Recognition();
      let transcript: string | null = null;
      recognition.lang = this.language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        transcript = event.results[0]?.[0]?.transcript.trim() || null;
      };
      recognition.onerror = ({ error }) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          reject(new VoicePermissionError());
        } else if (error !== 'no-speech' && error !== 'aborted') {
          reject(new Error(error));
        }
      };
      recognition.onend = () => resolve(transcript);
      this.browserSession = recognition;
      recognition.start();
    });
  }
}
