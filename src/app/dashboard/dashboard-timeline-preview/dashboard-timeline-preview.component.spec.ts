import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { DashboardTimelinePreviewComponent } from './dashboard-timeline-preview.component';
import { PostService } from 'src/app/services/post.service';
import { PostResponse } from 'src/app/models/post.interface';

describe('DashboardTimelinePreviewComponent', () => {
  let component: DashboardTimelinePreviewComponent;
  let fixture: ComponentFixture<DashboardTimelinePreviewComponent>;
  let postServiceSpy: jasmine.SpyObj<PostService>;

  const posts: PostResponse[] = [
    { id: 1, authorId: 2, authorName: 'Jordan Lee', authorEmail: 'jordan@x.com', content: 'Leg day done!', likes: 3, likedByMe: false, date: '2024-01-01', lastUpdate: '2024-01-01' },
    { id: 2, authorId: 3, authorName: 'Coach Sam', authorEmail: 'sam@x.com', content: 'New PB today', likes: 5, likedByMe: true, date: '2024-01-02', lastUpdate: '2024-01-02' },
    { id: 3, authorId: 4, authorName: 'Alex', authorEmail: 'alex@x.com', content: 'Great session', likes: 1, likedByMe: false, date: '2024-01-03', lastUpdate: '2024-01-03' },
    { id: 4, authorId: 5, authorName: 'Riley', authorEmail: 'riley@x.com', content: 'Rest day', likes: 0, likedByMe: false, date: '2024-01-04', lastUpdate: '2024-01-04' },
  ];

  function setup() {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getFeed']);

    TestBed.configureTestingModule({
      imports: [DashboardTimelinePreviewComponent, RouterTestingModule],
      providers: [{ provide: PostService, useValue: postServiceSpy }],
    });

    fixture = TestBed.createComponent(DashboardTimelinePreviewComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    postServiceSpy.getFeed.and.returnValue(of({ data: [], message: '', success: true, statusCode: 200 }));
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('shows only the first 3 posts, not the full feed', () => {
    setup();
    postServiceSpy.getFeed.and.returnValue(of({ data: posts, message: '', success: true, statusCode: 200 }));
    fixture.detectChanges();

    expect(component.posts.length).toBe(3);
    expect(component.posts.map(p => p.id)).toEqual([1, 2, 3]);
  });

  it('stops loading even if the feed request fails', () => {
    setup();
    postServiceSpy.getFeed.and.returnValue(throwError(() => new Error('network error')));
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.posts).toEqual([]);
  });
});
