import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { UNAUTHORIZED } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';
import jwt_decode from 'jwt-decode';
import { AuthenticationService } from './authentication.service';
import { LoginPromptModalComponent } from '../dashboard/user/login-prompt-modal/login-prompt-modal.component';

@Injectable({
  providedIn: 'root',
})
export class RouteGuardService {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private dialog: MatDialog,
    private snackBarService: SnackBarService
  ) {}

  openLoginPrompt() {
    const dialogRef = this.dialog.open(LoginPromptModalComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('canActivate called');
    const allowedRoles: string[] = [
      'user',
      'admin',
      'partner',
      'store',
      'driver',
      'trainer',
      'center',
      'client',
    ];

    const token: any = localStorage.getItem('token');

    let tokenPayload: any;
    try {
      tokenPayload = jwt_decode(token);
    } catch (err) {
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(tokenPayload.role)) {
      this.openLoginPrompt();
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRoles: string[] = route.data['expectedRole'];

    if (expectedRoles.includes(tokenPayload.role)) {
      return true;
    }

    this.snackBarService.openSnackBar(UNAUTHORIZED, 'error');
    this.router.navigate(['/dashboard']);
    console.log('canActivate', this.authService.isAuthenticated());
    return false;
  }
}
