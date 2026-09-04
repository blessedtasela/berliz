import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatThreadHeaderComponent } from './chat-thread-header.component';

describe('ChatThreadHeaderComponent', () => {
  let component: ChatThreadHeaderComponent;
  let fixture: ComponentFixture<ChatThreadHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatThreadHeaderComponent, RouterTestingModule],
    });
    fixture = TestBed.createComponent(ChatThreadHeaderComponent);
    component = fixture.componentInstance;
    component.userId = 5;
    component.name = 'Coach Sam';
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows the Berliz Certified Trainer badge for a trainer contact', () => {
    component.role = 'trainer';
    expect(component.certifiedLabel).toBe('Berliz Certified Trainer');
  });

  it('shows the Berliz Certified Center badge for a center contact', () => {
    component.role = 'center';
    expect(component.certifiedLabel).toBe('Berliz Certified Center');
  });

  it('shows no badge for a plain user contact', () => {
    component.role = 'user';
    expect(component.certifiedLabel).toBeNull();
  });

  it('emits back/close', () => {
    let backFired = false;
    let closeFired = false;
    component.back.subscribe(() => backFired = true);
    component.close.subscribe(() => closeFired = true);

    component.back.emit();
    component.close.emit();

    expect(backFired).toBeTrue();
    expect(closeFired).toBeTrue();
  });
});
