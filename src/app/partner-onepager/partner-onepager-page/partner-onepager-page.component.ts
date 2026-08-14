import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Unlisted partner pitch page — reachable only by direct URL (an unguessable
 * token, see app-routing.module.ts), never linked from any nav/footer and
 * never in sitemap.xml. The noindex/nofollow tags below are the second layer:
 * even if the URL ever leaked to a well-behaved crawler, it still won't get
 * indexed. Don't add this route to robots.txt — that file is public, so
 * listing the path there would defeat the point of it being unguessable.
 */
@Component({
  selector: 'app-partner-onepager-page',
  templateUrl: './partner-onepager-page.component.html',
  styleUrls: ['./partner-onepager-page.component.css']
})
export class PartnerOnepagerPageComponent implements OnInit {

  constructor(private meta: Meta, private title: Title) { }

  ngOnInit(): void {
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
    this.title.setTitle('Berliz Partner Program');
  }
}
