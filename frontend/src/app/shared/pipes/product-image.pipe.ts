import { Pipe, PipeTransform } from '@angular/core';
import { resolveProductImage } from '../../core/utils/image';

@Pipe({ name: 'productImage', standalone: true })
export class ProductImagePipe implements PipeTransform {
  transform(url?: string | null): string {
    return resolveProductImage(url);
  }
}
