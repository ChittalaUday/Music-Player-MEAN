import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';  // Import the AuthService
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isPasswordVisible: boolean = false;
  isSubmitting: boolean = false;
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  registerError: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);  // Inject the AuthService
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        dob: [null],
        profileImage: [null],
        bio: [''],
        gender: [''],
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }

  }

  // Handle image file selection
  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      this.selectedImage = file;
      reader.readAsDataURL(file);
    }
  }

  // Validator to check if password and confirmPassword match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Getter methods for form controls
  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get acceptTerms() {
    return this.registerForm.get('acceptTerms');
  }

  get gender() {
    return this.registerForm.get('gender');
  }

  get dob() {
    return this.registerForm.get('dob');
  }

  get bio() {
    return this.registerForm.get('bio');
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Submit the form and call the register API
  onSubmit(): void {
    console.log("Clicked");
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.registerError = null; // Reset any previous error

    const formData = new FormData();

    // Append all form data to the FormData object
    formData.append('name', this.registerForm.get('name')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('dateOfBirth', this.registerForm.get('dob')?.value || '');
    formData.append('bio', this.registerForm.get('bio')?.value || '');
    formData.append('gender', this.registerForm.get('gender')?.value || '');
    if (this.selectedImage) {
      formData.append('profileImage', this.selectedImage);
    }
    console.log(formData);

    this.authService.register(formData).subscribe({
      next: (res) => {
        console.log("Got");
        setTimeout(() => {
          this.authService.saveAuthData(res.token, res.user);
          this.router.navigate(['/home']);
          this.isSubmitting = false;

        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.registerError = err.error?.message || 'Registration failed'; // Display the error message
      }
    });
  }
}
