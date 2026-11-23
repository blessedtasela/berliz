import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionButtonComponent } from './reaction-button.component';

describe('ReactionButtonComponent', () => {
  let component: ReactionButtonComponent;
  let fixture: ComponentFixture<ReactionButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactionButtonComponent]
    });
    fixture = TestBed.createComponent(ReactionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** GN-124: the picker offers exactly these six, in this order -- LIKE is retired from it. */
  it('offers Love/Fire/Muscle/Clap/Wow/Celebrate, in that order, and nothing else', () => {
    expect(component.reactions.map(r => r.type)).toEqual(['LOVE', 'FIRE', 'STRONG', 'CLAP', 'WOW', 'CELEBRATE']);
    expect(component.reactions.map(r => r.label)).toEqual(['Love', 'Fire', 'Muscle', 'Clap', 'Wow', 'Celebrate']);
  });

  describe('a plain tap with no existing reaction (GN-124)', () => {
    it('shows "Love" as the unreacted label', () => {
      component.myReaction = null;
      expect(component.triggerLabel).toBe('Love');
    });

    it('emits LOVE, not the old LIKE default', () => {
      component.myReaction = null;
      const emitted: string[] = [];
      component.react.subscribe(r => emitted.push(r));

      component.onTrigger();

      expect(emitted).toEqual(['LOVE']);
    });
  });

  describe('a plain tap with an existing reaction', () => {
    it('re-emits the same reaction (so the backend reads it as "remove this")', () => {
      component.myReaction = 'FIRE';
      const emitted: string[] = [];
      component.react.subscribe(r => emitted.push(r));

      component.onTrigger();

      expect(emitted).toEqual(['FIRE']);
    });

    it('shows that reaction\'s own emoji and label, not the default', () => {
      component.myReaction = 'CELEBRATE';
      expect(component.triggerEmoji).toBe('🎉');
      expect(component.triggerLabel).toBe('Celebrate');
    });
  });

  it('picking a reaction from the picker emits it and closes the picker', () => {
    const emitted: string[] = [];
    component.react.subscribe(r => emitted.push(r));
    component.pickerOpen = true;

    component.pick('WOW');

    expect(emitted).toEqual(['WOW']);
    expect(component.pickerOpen).toBeFalse();
  });

  it('a legacy LIKE reaction (pre-dates the reaction picker) still renders without blowing up', () => {
    component.myReaction = 'LIKE';
    expect(component.reacted).toBeTrue();
    // Not one of the six pickable reactions -- falls back to the new default emoji/label rather than crashing.
    expect(component.triggerEmoji).toBe('❤️');
    expect(component.triggerLabel).toBe('Love');
  });
});
