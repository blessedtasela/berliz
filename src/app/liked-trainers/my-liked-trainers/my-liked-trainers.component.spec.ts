import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MyLikedTrainersComponent } from './my-liked-trainers.component';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyLikedTrainersComponent', () => {
  let component: MyLikedTrainersComponent;
  let fixture: ComponentFixture<MyLikedTrainersComponent>;

  beforeEach(() => {
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['getMyLikedTrainers', 'likeTrainer']);
    trainerServiceSpy.getMyLikedTrainers.and.returnValue(of({ data: [] }));
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MyLikedTrainersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });
    fixture = TestBed.createComponent(MyLikedTrainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
