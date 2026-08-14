import { Pipe, PipeTransform } from '@angular/core';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Template-side wrapper around `resolveStrapiUrl` — use as `{{ path | strapiUrl }}`
 * or `[src]="path | strapiUrl"`. See strapi-url.util.ts for why this exists.
 */
@Pipe({
  name: 'strapiUrl',
  standalone: true
})
export class StrapiUrlPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    return resolveStrapiUrl(path);
  }
}
