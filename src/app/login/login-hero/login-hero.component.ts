import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-login-hero',
    templateUrl: './login-hero.component.html',
    styleUrls: ['./login-hero.component.css'],
    standalone: false
})
export class LoginHeroComponent {
  /** 'login' greets a returning member; 'signup' greets someone creating an account (it used to say "Welcome back" on both). */
  @Input() mode: 'login' | 'signup' = 'login';

  get eyebrow(): string {
    return this.mode === 'signup' ? 'Join Berliz' : 'Welcome back';
  }
}
