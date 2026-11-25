import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkStatus {
  private readonly onlineState = signal(true);

  readonly online = this.onlineState.asReadonly();

  async init(): Promise<void> {
    await Network.addListener('networkStatusChange', ({ connected }) => this.onlineState.set(connected));
    await this.refresh();
  }

  async refresh(): Promise<boolean> {
    const { connected } = await Network.getStatus();
    this.onlineState.set(connected);
    return connected;
  }
}
