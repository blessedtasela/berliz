import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerClientsComponent } from './trainer-clients.component';

describe('TrainerClientsComponent', () => {
  let component: TrainerClientsComponent;
  let fixture: ComponentFixture<TrainerClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerClientsComponent]
    });
    fixture = TestBed.createComponent(TrainerClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
