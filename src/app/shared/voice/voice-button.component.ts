import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { mic, micOutline } from 'ionicons/icons';

import { AppToast } from '../ui/app-toast.service';

import { VoiceInput, VoicePermissionError } from './voice-input.service';

@Component({
  selector: 'app-voice-button',
  template: `
    @if (voice.supported) {
      <ion-button
        fill="clear"
        color="medium"
        size="small"
        [class.listening]="voice.listening()"
        [attr.aria-label]="(voice.listening() ? 'voice.stop' : 'voice.start') | translate"
        [attr.aria-pressed]="voice.listening()"
        (click)="toggle($event)"
      >
        <ion-icon slot="icon-only" [name]="voice.listening() ? 'mic' : 'mic-outline'"></ion-icon>
      </ion-button>
    }
  `,
  styles: `
    :host {
      display: contents;
    }

    ion-button {
      margin: 0;
    }

    .listening {
      --color: var(--app-danger);
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      50% {
        opacity: 0.45;
      }
    }
  `,
  imports: [IonButton, IonIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceButtonComponent {
  protected readonly voice = inject(VoiceInput);
  private readonly toast = inject(AppToast);

  readonly transcribed = output<string>();

  constructor() {
    addIcons({ mic, micOutline });
  }

  protected async toggle(event: Event): Promise<void> {
    event.stopPropagation();
    try {
      const text = await this.voice.listen();
      if (text) {
        this.transcribed.emit(text);
      }
    } catch (error) {
      await this.toast.error(error instanceof VoicePermissionError ? 'voice.errors.denied' : 'voice.errors.failed');
    }
  }
}
