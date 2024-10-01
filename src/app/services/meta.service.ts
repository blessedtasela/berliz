import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { MetaDataConfig } from 'src/environments/meta-data-configs';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private renderer: Renderer2;

  constructor(
    private meta: Meta,
    private rendererFactory: RendererFactory2 // Inject RendererFactory2 instead of Renderer2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null); // Create a Renderer2 instance
  }

  updateMetaTags(metaDataKey: any | null = null) {
    const metaData = metaDataKey ? MetaDataConfig[metaDataKey] : MetaDataConfig['default'];

    // Update the title
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

  updateStructuredData(structuredData: any) {
    // Remove any existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      this.renderer.removeChild(document.head, existingScript);
    }

    // Create new script element for structured data
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.appendChild(script, this.renderer.createText(JSON.stringify(structuredData)));

    // Append script to head
    this.renderer.appendChild(document.head, script);
  }
}
