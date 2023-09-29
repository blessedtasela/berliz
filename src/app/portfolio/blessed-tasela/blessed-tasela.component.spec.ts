import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlessedTaselaComponent } from './blessed-tasela.component';

describe('BlessedTaselaComponent', () => {
  let component: BlessedTaselaComponent;
  let fixture: ComponentFixture<BlessedTaselaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlessedTaselaComponent]
    });
    fixture = TestBed.createComponent(BlessedTaselaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
