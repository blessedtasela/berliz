import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { RecapCardComponent } from './recap-card.component';
import { RecapService } from 'src/app/services/recap.service';

describe('RecapCardComponent', () => {
  let fixture: ComponentFixture<RecapCardComponent>;

  function render(data: any) {
    const service = jasmine.createSpyObj('RecapService', ['getMyRecap']);
    service.getMyRecap.and.returnValue(of({ data }));
    TestBed.configureTestingModule({
      imports: [RecapCardComponent],
      providers: [{ provide: RecapService, useValue: service }, provideRouter([])],
    });
    fixture = TestBed.createComponent(RecapCardComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the real numbers', () => {
    const el = render({ activeDays: 12, workoutCount: 5, runCount: 3, longestStreakDays: 4, headline: 'Nice year' });
    expect(el.textContent).toContain('12 active days');
    expect(el.textContent).toContain('8 sessions');
  });

  it('never shows NaN when the counts are missing from the response', () => {
    const el = render({ headline: 'Your recap is ready.' });
    expect(el.textContent).not.toContain('NaN');
    expect(el.textContent).toContain('0 sessions');
    expect(el.textContent).toContain('0 active days');
  });
});
