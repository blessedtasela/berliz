import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NewsletterService } from 'src/app/services/newsletter.service';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent implements OnInit {
  newsletterForm!: FormGroup;
  onAddNewsletterEmit = new EventEmitter();
  invalidForm: boolean = false;
  responseMessage: any;


  constructor(private formBuilder: FormBuilder,
    private newsletterService: NewsletterService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }

  ngOnInit() {
    this.newsletterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]]
    });
  }



  addNewsletter(): void {
    this.ngxService.start();
    if (this.newsletterForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.newsletterService.addNewsletter(this.newsletterForm.value)
        .subscribe((response: any) => {
          this.newsletterForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onAddNewsletterEmit.emit();
          this.ngxService.stop();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

}
