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
});
