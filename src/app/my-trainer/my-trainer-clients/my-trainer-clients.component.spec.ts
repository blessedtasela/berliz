import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerClientsComponent } from './my-trainer-clients.component';

describe('MyTrainerClientsComponent', () => {
  let component: MyTrainerClientsComponent;
  let fixture: ComponentFixture<MyTrainerClientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerClientsComponent]
    });
    fixture = TestBed.createComponent(MyTrainerClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
