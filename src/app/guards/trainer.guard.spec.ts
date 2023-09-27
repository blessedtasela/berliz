import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TrainerGuard } from './trainer.guard';
import { TrainerService } from '../services/trainer.service';

describe('TrainerGuard', () => {
  let guard: TrainerGuard;
  let mockRouter: Partial<Router>;
  let mockTrainerService: Partial<TrainerService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate') // Mock the Router's navigate method
    };

    mockTrainerService = {
      isValidTrainer: (name: string) => true // Mock the isValidTrainer method to always return true for testing purposes
    };

    TestBed.configureTestingModule({
      providers: [
        TrainerGuard,
        { provide: Router, useValue: mockRouter },
        { provide: TrainerService, useValue: mockTrainerService }
      ]
    });

    guard = TestBed.inject(TrainerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for valid trainer id', () => {
    const route = new ActivatedRouteSnapshot();

    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled(); // We expect that navigate method is not called for valid trainer
  });

  it('should navigate to trainers page for invalid trainer id', () => {
    const route = new ActivatedRouteSnapshot();


    const state: RouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);

    expect(guard.canActivate(route, state)).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/trainers']); // We expect that navigate method is called for invalid trainer
  });
});
