import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

import type { GeoPoint } from './location.service';

@Pipe({ name: 'coordinates' })
export class CoordinatesPipe implements PipeTransform {
  transform(point: Pick<GeoPoint, 'lat' | 'lng'> | null | undefined, digits = 5): string {
    return point ? `${point.lat.toFixed(digits)}, ${point.lng.toFixed(digits)}` : '';
  }
}
