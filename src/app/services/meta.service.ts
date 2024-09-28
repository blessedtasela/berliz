import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { MetaDataConfig } from 'src/environments/meta-data-configs';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(private meta: Meta, private titleService: Title) {}

  updateMetaTags(metaDataKey: any | null = null) {
    const metaData = metaDataKey ? MetaDataConfig[metaDataKey] : MetaDataConfig['default'];

    // Update the title
    this.titleService.setTitle(metaData.title);

    // Update common meta tags
    this.meta.updateTag({ name: 'description', content: metaData.description });
    
    // Open Graph meta tags
    this.meta.updateTag({ property: 'og:title', content: metaData.title });
    this.meta.updateTag({ property: 'og:description', content: metaData.description });
    this.meta.updateTag({ property: 'og:image', content: metaData.imageUrl });
    this.meta.updateTag({ property: 'og:url', content: metaData.url });
    
    // Twitter meta tags
    this.meta.updateTag({ name: 'twitter:title', content: metaData.title });
    this.meta.updateTag({ name: 'twitter:description', content: metaData.description });
    this.meta.updateTag({ name: 'twitter:image', content: metaData.imageUrl });
  }
}
