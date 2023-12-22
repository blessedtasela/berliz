import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSubTaskComponent } from './search-sub-task.component';

describe('SearchSubTaskComponent', () => {
  let component: SearchSubTaskComponent;
  let fixture: ComponentFixture<SearchSubTaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchSubTaskComponent]
    });
    fixture = TestBed.createComponent(SearchSubTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
