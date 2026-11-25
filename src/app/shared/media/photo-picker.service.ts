import { Injectable, inject } from '@angular/core';
import type { MediaResult } from '@capacitor/camera';
import { Camera, MediaTypeSelection } from '@capacitor/camera';
import { TranslateService } from '@ngx-translate/core';

import { NativeActionSheet } from '../native/action-sheet.service';

import { MAX_IMAGE_DIMENSION, resizeImage } from './resize-image';

type PhotoSource = 'camera' | 'gallery';

function isCancellation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /cancel/i.test(message);
}

@Injectable({ providedIn: 'root' })
export class PhotoPicker {
  private readonly actionSheet = inject(NativeActionSheet);
  private readonly translate = inject(TranslateService);

  async pick(): Promise<Blob | null> {
    const source = await this.actionSheet.choose<PhotoSource>({
      title: this.translate.instant('media.source.title'),
      choices: [
        { label: this.translate.instant('media.source.camera'), value: 'camera' },
        { label: this.translate.instant('media.source.gallery'), value: 'gallery' },
      ],
      cancelLabel: this.translate.instant('common.cancel'),
    });
    if (!source) {
      return null;
    }
    try {
      const media = source === 'camera' ? await this.takePhoto() : await this.chooseFromGallery();
      return media?.webPath ? await resizeImage(await (await fetch(media.webPath)).blob()) : null;
    } catch (error) {
      if (isCancellation(error)) {
        return null;
      }
      throw error;
    }
  }

  private takePhoto(): Promise<MediaResult> {
    return Camera.takePhoto({
      quality: 85,
      targetWidth: MAX_IMAGE_DIMENSION,
      targetHeight: MAX_IMAGE_DIMENSION,
      correctOrientation: true,
    });
  }

  private async chooseFromGallery(): Promise<MediaResult | undefined> {
    const { results } = await Camera.chooseFromGallery({ mediaType: MediaTypeSelection.Photo, limit: 1 });
    return results[0];
  }
}
