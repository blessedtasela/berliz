import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { DashboardTimelineComponent } from './dashboard-timeline.component';
import { PostService } from 'src/app/services/post.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ContentReportService } from 'src/app/services/content-report.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { SavedService } from 'src/app/services/saved.service';
import { PostResponse } from 'src/app/models/post.interface';

describe('DashboardTimelineComponent', () => {
  let component: DashboardTimelineComponent;
  let fixture: ComponentFixture<DashboardTimelineComponent>;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let snackBarSpy: jasmine.SpyObj<SnackBarService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let queryParamMap: Record<string, string>;

  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getFeed', 'getMyTimeline', 'getPostById']);
    postServiceSpy.getFeed.and.returnValue(of({ message: '', data: [], success: true, statusCode: 200 }));
    postServiceSpy.getMyTimeline.and.returnValue(of({ message: '', data: [], success: true, statusCode: 200 }));

    snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    queryParamMap = {};

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    userServiceSpy.getUser.and.returnValue(of({ message: '', data: null, success: true, statusCode: 200 }));
    const contentReportServiceSpy = jasmine.createSpyObj('ContentReportService', ['report']);
    const workoutServiceSpy = jasmine.createSpyObj('WorkoutService', ['getTemplates']);
    workoutServiceSpy.getTemplates.and.returnValue(of({ message: '', data: [], success: true, statusCode: 200 }));
    const savedServiceSpy = jasmine.createSpyObj('SavedService', ['refresh']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadFile']);

    TestBed.configureTestingModule({
      imports: [DashboardTimelineComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: StrapiService, useValue: strapiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: ContentReportService, useValue: contentReportServiceSpy },
        { provide: WorkoutService, useValue: workoutServiceSpy },
        { provide: SavedService, useValue: savedServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { get queryParamMap() { return convertToParamMap(queryParamMap); } } }
        },
      ]
    }).overrideComponent(DashboardTimelineComponent, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(DashboardTimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('does nothing when there is no ?postId= query param', () => {
    fixture.detectChanges();
    expect(postServiceSpy.getPostById).not.toHaveBeenCalled();
  });

  it('opens the post sheet for ?postId= and clears the query param after', () => {
    queryParamMap = { postId: '55' };
    const post = { id: 55 } as PostResponse;
    postServiceSpy.getPostById.and.returnValue(of({ message: '', data: post, success: true, statusCode: 200 }));

    fixture.detectChanges();

    expect(postServiceSpy.getPostById).toHaveBeenCalledWith(55);
    expect(component.sheetPost).toBe(post);
    expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: {} }));
  });

  it('shows an error and clears the query param when the post cannot be fetched', () => {
    queryParamMap = { postId: '404' };
    postServiceSpy.getPostById.and.returnValue(throwError(() => new Error('not found')));

    fixture.detectChanges();

    expect(component.sheetPost).toBeNull();
    expect(snackBarSpy.openSnackBar).toHaveBeenCalledWith('That post is no longer available', 'error');
    expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: {} }));
  });
});
