import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fileValidator } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-testimonial-form',
  templateUrl: './testimonial-form.component.html',
  styleUrls: ['./testimonial-form.component.css']
})
export class TestimonialFormComponent implements OnInit{
  testimonialForm!: FormGroup;
  invalidForm: boolean = false;

  constructor(private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.testimonialForm = this.fb.group({
      'name': ['', Validators.required],
      'testimony': ['', Validators.required],
      'imageUrl': ['', Validators.compose([Validators.required, fileValidator])],
      'center': ['', Validators.required]
    });
  }

  validateImage(input: HTMLInputElement) {
    const file = input.files && input.files[0];

    if (file) {
      this.testimonialForm.get('imageUrl')?.updateValueAndValidity();
    }
  }
    
  submitForm(): void {
    if (this.testimonialForm.invalid) {
      this.invalidForm = true
      console.log('invalid form');
    }
    else {
      const currentDate = new Date().toISOString().split('T')[0];
      const formValue = {
        ...this.testimonialForm.value,
        date: currentDate
      };

      // this.jsonApiService
      //   .addTestimonial(formValue)
      //   .subscribe(res => {
      //     console.log('You submitted:', res);
      //   });

      alert('Thank you for your Testimonial');
      this.testimonialForm.reset();
      this.invalidForm = false;
      this.router.navigate(['/testimonial']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
