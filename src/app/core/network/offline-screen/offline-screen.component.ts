import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';

import { NetworkStatus } from '../network-status.service';

const MIN_RETRY_FEEDBACK_MS = 600;

@Component({
  selector: 'app-offline-screen',
  templateUrl: './offline-screen.component.html',
  styleUrl: './offline-screen.component.scss',
  imports: [IonButton, IonIcon, IonSpinner, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'offline-title' },
})
export class OfflineScreenComponent {
  private readonly network = inject(NetworkStatus);

  protected readonly checking = signal(false);

  constructor() {
    addIcons({ cloudOfflineOutline });
  }

  protected async retry(): Promise<void> {
    this.checking.set(true);
    await Promise.all([this.network.refresh(), new Promise((resolve) => setTimeout(resolve, MIN_RETRY_FEEDBACK_MS))]);
    this.checking.set(false);
  }
}
