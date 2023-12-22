import { Component, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  currentRoute: any;
  openMenu: boolean = false;
  mdScreen: boolean = false;
  userData!: any;
  responseMessage: any;
  profilePhoto: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) {
    this.currentRoute = this.router.url
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.onResize();
    this.subscribeToCloseSideBar()
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
      this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto;
    });
  }


  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.openMenu = window.innerWidth >= 768; // Change the breakpoint as needed
  }

  subscribeToCloseSideBar() {
    document.addEventListener('mousedown', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('sidebarView');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.openMenu = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  logout() {
    console.log('logging out')
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response: any) => {
      dialogRef.close();
      this.userService.logout();
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
  }
}

