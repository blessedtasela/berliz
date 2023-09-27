import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { genericError } from 'src/validators/form-validators.module';
import { PartnerDetailsComponent } from '../partner-details/partner-details.component';
import { UpdatePartnerFileModalComponent } from '../update-partner-file-modal/update-partner-file-modal.component';
import { UpdatePartnerModalComponent } from '../update-partner-modal/update-partner-modal.component';
import { AddPartnerModalComponent } from '../add-partner-modal/add-partner-modal.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ViewCertificateModalComponent } from 'src/app/shared/view-certificate-modal/view-certificate-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent {
  partnersData: Partners[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredPartnersData: Partners[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalPartners: number = 0;
  results: EventEmitter<Partners[]> = new EventEmitter<Partners[]>()

  constructor(private partnerService: PartnerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.getAllPartners().subscribe(() => {
      this.initializeSearch();
      this.filteredPartnersData = this.partnersData
      this.counter = this.filteredPartnersData.length
      this.totalPartners = this.partnersData.length;
    });
  }


  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
        })
      )
      .subscribe(
        (results: Partners[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  generateBlobUrl(data: any, mimeType: string): SafeResourceUrl {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getAllPartners(): Observable<Partners[]> {
    this.ngxService.start();
    return this.partnerService.getAllPartners().pipe(
      tap((response: any) => {
        this.partnersData = response; // Assuming response is an array of partners

        // Loop through each partner and generate Blob URLs for CV and certificate
        for (const partner of this.partnersData) {
          partner.cv = "data:application/pdf;base64," + partner.cv;
          partner.certificate = "data:application/pdf;base64," + partner.certificate;
          // console.log('pdf cv: ', partner.cv)
        }

        this.ngxService.stop();
      }),
      catchError((error) => {
        this.ngxService.stop();
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  detectDocumentType(data: ArrayBuffer): 'pdf' | 'doc' | null {
    // Add logic to detect the file type based on its content.
    const view = new Uint8Array(data);
    if (view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46) {
      return 'pdf'; // PDF signature: %PDF
    } else if (view[0] === 0xD0 && view[1] === 0xCF && view[2] === 0x11 && view[3] === 0xE0) {
      return 'doc'; // Word 97-2003 signature: D0 CF 11 E0
    } else {
      return null; // Unknown file type
    }
  }

  sortPartnersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredPartnersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'motivation':
        this.filteredPartnersData.sort((a, b) => {
          return a.motivation.localeCompare(b.motivation);
        });
        break;

      case 'id':
        this.filteredPartnersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.filteredPartnersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
    }
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortPartnersData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Partners[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredPartnersData = this.partnersData;
      this.counter = this.filteredPartnersData.length;
      return of(this.filteredPartnersData);
    }
    this.filteredPartnersData = this.partnersData.filter((partner: Partners) => {
      switch (this.selectedSearchCriteria) {
        case 'motivation':
          return partner.motivation.toLowerCase().includes(query);
        case 'id':
          return partner.id.toString().includes(query);
        case 'email':
          return partner.user.email.toLowerCase().includes(query);
        case 'role':
          return partner.role.toLowerCase().includes(query);
        case 'status':
          return partner.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredPartnersData.length;
    return of(this.filteredPartnersData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddPartner() {
    const dialogRef = this.dialog.open(AddPartnerModalComponent, {
      width: '800px'
    });
    const childComponentInstance = dialogRef.componentInstance as AddPartnerModalComponent;

    // Set the event emitter before closing the dialog
    childComponentInstance.onAddPartnerEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without performing any action');
      }
    });
  }

  openUpdatePartner(id: number) {
    try {
      const partner = this.partnersData.find(partner => partner.id === id);
      if (partner) {
        const dialogRef = this.dialog.open(UpdatePartnerModalComponent, {
          width: '800px',
          data: {
            partnerData: partner,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdatePartnerModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdatePartnerEmit.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('partner not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check partner status", 'error');
    }
  }


  updatePartnerStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const partner = this.partnersData.find(partner => partner.id === id);
    const message = partner?.status === 'false'
      ? 'activate this partner\'s as a ' + partner.role
      : 'deactivate this partner\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.partnerService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Partner status updated successfully');
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  openPartnerDetails(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    if (partner) {
      const dialogRef = this.dialog.open(PartnerDetailsComponent, {
        width: '800px',
        data: {
          partnerData: partner,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as PartnerDetailsComponent;
      const sub = dialogRef.componentInstance.onRejectApplicationEmit.subscribe((res: any) => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  deletePartner(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this partner. This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.partnerService.deletePartner(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Partner deleted successfully');
          this.handleEmitEvent();
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  openViewCertificate(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const certificate = partner?.certificate;
    if (partner) {
      const dialogRef = this.dialog.open(ViewCertificateModalComponent, {
        width: '800px',
        data: {
          partnerData: certificate,
        },
        panelClass: 'mat-dialog-height',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  openViewCV(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const cv = partner?.cv;
    if (partner) {
      const dialogRef = this.dialog.open(ViewCvModalComponent, {
        width: '800px',
        data: {
          partnerData: cv,
        },
        panelClass: 'mat-dialog-height',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

