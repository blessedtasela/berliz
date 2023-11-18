import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { Categories } from 'src/app/models/categories.interface';
import { UserStateService } from 'src/app/services/user-state.service';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { Partners } from 'src/app/models/partners.interface';
import { UserService } from 'src/app/services/user.service';
import { Centers } from 'src/app/models/centers.interface';
import { Newsletter } from 'src/app/models/newsletter.model';
import { Tags } from 'src/app/models/tags.interface';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.css']
})
export class SidebarNavigationComponent {
  openMenu: boolean = false;
  userData: any;
  responseMessage: any;
  profilePhoto: any;
  currentRoute: any;
  @Input() isSearch: boolean = false;
  @Output() categoriesResults: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  @Output() contactUsResults: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()
  @Output() trainersResults: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()
  @Output() usersResults: EventEmitter<Users[]> = new EventEmitter<Users[]>()
  @Output() partnersResults: EventEmitter<Partners[]> = new EventEmitter<Partners[]>()
  @Output() centersResult: EventEmitter<Centers[]> = new EventEmitter<Centers[]>()
  @Output() newslettersResult: EventEmitter<Newsletter[]> = new EventEmitter<Newsletter[]>();
  @Output() tagsResult: EventEmitter<Tags[]> = new EventEmitter<Tags[]>();
  @Input() searchComponent: string = ''

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit(): void {
    this.onResize();
    this.subscribeToCloseSideBar()
    this.handleEmitEvent();
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith('/' + path);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.openMenu = window.innerWidth <= 768; // Change the breakpoint as needed
  }

  subscribeToCloseSideBar() {
    document.addEventListener('click', (event) => {
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

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
      this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto;
    });
  }

  handleCategorySearchResults(results: Categories[]): void {
    this.categoriesResults.emit(results)
  }

  handleContactUsSearchResults(results: ContactUs[]): void {
    this.contactUsResults.emit(results)
    this.isSearch = true;
  }

  handleTrainerSearchResults(results: Trainers[]): void {
    this.trainersResults.emit(results)
  }

  handleUserSearchResults(results: Users[]): void {
    this.usersResults.emit(results)
  }

  handlePartnerSearchResults(results: Partners[]): void {
    this.partnersResults.emit(results)
  }

  handleCenterSearchResults(results: Centers[]): void {
    this.centersResult.emit(results)
  }

  handleNewsletterSearchResults(results: Newsletter[]): void {
    this.newslettersResult.emit(results)
  }

  handleTagSearchResults(results: Tags[]) {
    this.tagsResult.emit(results)
  }

  openUpdateProfilePhoto() {
    const dialogRef = this.dialog.open(UpdateProfilePhotoModalComponent, {
      width: '400px',
      data: {
        image: this.profilePhoto
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateProfilePhotoModalComponent;
    childComponentInstance.onUpdateProfilePhoto.subscribe(() => {
      this.ngxService.start()
      this.handleEmitEvent();
      this.ngxService.stop()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig profile photo');
      }
    });
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
