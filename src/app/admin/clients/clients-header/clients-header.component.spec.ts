import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsHeaderComponent } from './clients-header.component';

describe('ClientsHeaderComponent', () => {
  let component: ClientsHeaderComponent;
  let fixture: ComponentFixture<ClientsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientsHeaderComponent]
    });
    fixture = TestBed.createComponent(ClientsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
