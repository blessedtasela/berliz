import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMemberComponent } from './search-member.component';

describe('SearchMemberComponent', () => {
  let component: SearchMemberComponent;
  let fixture: ComponentFixture<SearchMemberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMemberComponent]
    });
    fixture = TestBed.createComponent(SearchMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
