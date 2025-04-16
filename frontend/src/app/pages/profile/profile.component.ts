import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service'; // Adjust path if needed
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profileForm: FormGroup = new FormGroup({});
  editMode = false;
  loading = false;
  profileData: any = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadFromLocalStorage();  // Load first from localStorage
    this.fetchUserProfile();      // Then refresh from API
  }

  // Load profile from localStorage
  loadFromLocalStorage(): void {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      this.user = {
        ...parsed,
        stats: {
          playlists: 42,
          liked: 328,
          uploads: 17
        }
      };
      this.profileData = parsed;
      this.initForm();
    }
  }

  fetchUserProfile(): void {
    this.loading = true;
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.user = {
          ...data,
          stats: this.user?.stats || {
            playlists: 42,
            liked: 328,
            uploads: 17
          }
        };
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.loading = false;
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: [this.profileData?.name || '', Validators.required],
      email: [this.profileData?.email || '', [Validators.required, Validators.email]],
      avatar: [this.profileData?.profilePicture || ''],
      gender: [this.profileData?.gender || ''],
      dob: [this.formatDate(this.profileData?.dateOfBirth)],
      bio: [this.profileData?.bio || '']
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  toggleEditMode(): void {
    this.editMode = true;
    this.initForm();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.initForm();
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const updatedData = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
        profilePicture: this.profileForm.value.avatar,
        gender: this.profileForm.value.gender,
        dateOfBirth: this.profileForm.value.dob,
        bio: this.profileForm.value.bio
      };

      this.profileService.updateUserProfile(updatedData).subscribe({
        next: (updatedUser) => {
          this.user = {
            ...updatedUser,
            stats: this.user.stats
          };
          this.profileData = updatedUser;
          this.editMode = false;
          this.initForm();
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      const file = fileInput.files[0];
      if (file) {
        this.profileService.uploadProfileImage(file).subscribe({
          next: (res) => {
            this.profileForm.patchValue({
              profilePicture: res.imageUrl
            });
          },
          error: (err) => {
            console.error('Image upload failed:', err);
          }
        });
      }
    }
  }

  removeProfileImage(): void {
    this.profileService.deleteProfileImage().subscribe({
      next: () => {
        this.profileForm.patchValue({ avatar: '' });
      },
      error: (err) => {
        console.error('Failed to delete profile image:', err);
      }
    });
  }
}
