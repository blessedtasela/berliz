import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsDetailsModalComponent } from './clients-details-modal.component';

describe('ClientsDetailsModalComponent', () => {
  let component: ClientsDetailsModalComponent;
  let fixture: ComponentFixture<ClientsDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientsDetailsModalComponent]
    });
    fixture = TestBed.createComponent(ClientsDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
