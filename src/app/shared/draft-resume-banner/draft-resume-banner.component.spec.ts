import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraftResumeBannerComponent } from './draft-resume-banner.component';
import { DraftEntry } from 'src/app/models/draft.model';

describe('DraftResumeBannerComponent', () => {
  let fixture: ComponentFixture<DraftResumeBannerComponent>;
  let component: DraftResumeBannerComponent;

  const draft: DraftEntry = { savedAt: Date.now() - 60_000 } as DraftEntry;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DraftResumeBannerComponent] });
    fixture = TestBed.createComponent(DraftResumeBannerComponent);
    component = fixture.componentInstance;
  });

  it('renders nothing without a draft', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div')).toBeNull();
  });

  it('renders the light skin by default', () => {
    component.draft = draft;
    fixture.detectChanges();

    const banner: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(banner.className).toContain('bg-amber-50');
  });

  it('renders the brand-dark skin when [dark]="true"', () => {
    component.draft = draft;
    component.dark = true;
    fixture.detectChanges();

    const banner: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(banner.className).toContain('bg-amber-950/30');
    expect(banner.className).not.toContain('bg-amber-50');
  });
});
