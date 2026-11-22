import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RecommendedTrainersComponent } from './recommended-trainers.component';
import { AuthService } from 'src/app/services/auth.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { FollowService } from 'src/app/services/follow.service';
import { Trainers } from 'src/app/models/trainers.interface';

describe('RecommendedTrainersComponent', () => {
  let component: RecommendedTrainersComponent;
  let fixture: ComponentFixture<RecommendedTrainersComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let trainerService: jasmine.SpyObj<TrainerService>;
  let followService: jasmine.SpyObj<FollowService>;

  function trainer(id: number, userId: number): Trainers {
    return { id, userId, name: `Trainer ${id}` } as Trainers;
  }

  function setup() {
    authService = jasmine.createSpyObj('AuthService', ['hasSession', 'isTrainer', 'isCenter']);
    trainerService = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    followService = jasmine.createSpyObj('FollowService', ['getFollowing']);

    TestBed.configureTestingModule({
      imports: [RecommendedTrainersComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TrainerService, useValue: trainerService },
        { provide: FollowService, useValue: followService },
      ],
    });

    fixture = TestBed.createComponent(RecommendedTrainersComponent);
    component = fixture.componentInstance;
  }

  it('stays hidden for a signed-out visitor, with no API calls', () => {
    setup();
    authService.hasSession.and.returnValue(false);

    fixture.detectChanges();

    expect(component.visible).toBeFalse();
    expect(trainerService.getActiveTrainers).not.toHaveBeenCalled();
  });

  it('stays hidden for a trainer -- recommending trainers to a trainer does not apply', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    authService.isTrainer.and.returnValue(true);
    authService.isCenter.and.returnValue(false);

    fixture.detectChanges();

    expect(component.visible).toBeFalse();
  });

  it('stays hidden for a center, same reasoning', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    authService.isTrainer.and.returnValue(false);
    authService.isCenter.and.returnValue(true);

    fixture.detectChanges();

    expect(component.visible).toBeFalse();
  });

  it('shows for a plain signed-in user, excluding trainers already followed', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    authService.isTrainer.and.returnValue(false);
    authService.isCenter.and.returnValue(false);
    trainerService.getActiveTrainers.and.returnValue(of({ success: true, message: '', data: [trainer(1, 10), trainer(2, 20), trainer(3, 30)], statusCode: 200 } as any));
    followService.getFollowing.and.returnValue(of({ success: true, message: '', data: [{ userId: 20 }], statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.visible).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.trainers.map(t => t.id)).toEqual([1, 3]);
  });

  it('caps the list at 8 trainers', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    authService.isTrainer.and.returnValue(false);
    authService.isCenter.and.returnValue(false);
    const many = Array.from({ length: 12 }, (_, i) => trainer(i, i * 10));
    trainerService.getActiveTrainers.and.returnValue(of({ success: true, message: '', data: many, statusCode: 200 } as any));
    followService.getFollowing.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.trainers.length).toBe(8);
  });

  it('degrades to an empty list instead of throwing when a request fails', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    authService.isTrainer.and.returnValue(false);
    authService.isCenter.and.returnValue(false);
    trainerService.getActiveTrainers.and.returnValue(throwError(() => new Error('boom')));
    followService.getFollowing.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.trainers).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
