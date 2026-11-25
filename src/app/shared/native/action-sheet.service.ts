import { Injectable } from '@angular/core';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

export interface ActionSheetChoice<T> {
  readonly label: string;
  readonly value: T;
  readonly destructive?: boolean;
}

export interface ActionSheetRequest<T> {
  readonly title?: string;
  readonly message?: string;
  readonly choices: readonly ActionSheetChoice<T>[];
  readonly cancelLabel: string;
}

@Injectable({ providedIn: 'root' })
export class NativeActionSheet {
  async choose<T>({ title, message, choices, cancelLabel }: ActionSheetRequest<T>): Promise<T | null> {
    const { index, canceled } = await ActionSheet.showActions({
      title,
      message,
      options: [
        ...choices.map((choice) => ({
          title: choice.label,
          style: choice.destructive ? ActionSheetButtonStyle.Destructive : ActionSheetButtonStyle.Default,
        })),
        { title: cancelLabel, style: ActionSheetButtonStyle.Cancel },
      ],
    });
    return canceled ? null : (choices[index]?.value ?? null);
  }
}
