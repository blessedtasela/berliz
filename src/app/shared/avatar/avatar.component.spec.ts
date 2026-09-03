import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AvatarComponent] });
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('builds a data URI from the base64 photo when one is set', () => {
    component.photo = 'abc123';
    expect(component.photoSrc).toBe('data:image/*;base64,abc123');
  });

  it('falls back to initials when there is no photo', () => {
    component.photo = null;
    component.name = 'Jordan Lee';
    expect(component.photoSrc).toBeNull();
    expect(component.initials).toBe('JL');
  });

  it('initials falls back to a single letter for a one-word name, and "?" for no name', () => {
    component.name = 'Cher';
    expect(component.initials).toBe('C');

    component.name = '';
    expect(component.initials).toBe('?');
  });

  // Regression: a photo that fails to load (corrupt/invalid data) used to
  // just show a broken-image icon forever -- photoSrc stayed truthy since it
  // only checked whether a `photo` value was set, not whether it actually
  // rendered.
  it('falls back to initials once the <img> reports a load error', () => {
    component.photo = 'not-a-real-image';
    component.name = 'Jordan Lee';
    expect(component.photoSrc).toBe('data:image/*;base64,not-a-real-image');

    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    img.dispatchEvent(new Event('error'));

    expect(component.photoSrc).toBeNull();
  });

  it('gives a new photo a fresh chance after a previous one failed', () => {
    component.photo = 'bad-data';
    component.photoFailed = true;

    component.ngOnChanges({ photo: {} as any });

    expect(component.photoFailed).toBeFalse();
  });
});
