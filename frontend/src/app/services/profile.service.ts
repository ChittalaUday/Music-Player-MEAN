import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface UserProfile {
  _id:string;
  userId: string;
  name: string;
  email: string;
  profilePicture: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:5000/me';  // Assuming endpoint is /me/:id

  constructor(private http: HttpClient) {}

  // Utility to get user ID from localStorage
  private getUserId(): string {
    const user = localStorage.getItem('user');
    if (!user) {
      throw new Error('User not logged in');
    }
    const parsed = JSON.parse(user);
    return parsed._id || parsed.userId;
  }

  // Fetch user profile
  getUserProfile(): Observable<UserProfile> {
    const userId = this.getUserId();
    return this.http.get<UserProfile>(`${this.baseUrl}/${userId}`);
  }

  // Update user profile and sync localStorage
  updateUserProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    const userId = this.getUserId();
    return this.http.put<UserProfile>(`${this.baseUrl}/${userId}`, profileData).pipe(
      tap((updatedUser) => {
        const existing = localStorage.getItem('user');
        if (existing) {
          const parsed = JSON.parse(existing);
          const merged = { ...parsed, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(merged));
        }
      })
    );
  }

  // Upload profile image and update localStorage with new image URL
  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const userId = this.getUserId();
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/${userId}/image`, formData).pipe(
      tap((res) => {
        const existing = localStorage.getItem('user');
        if (existing && res.imageUrl) {
          const parsed = JSON.parse(existing);
          parsed.profilePicture = res.imageUrl;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      })
    );
  }

  // Delete profile image and remove image URL from localStorage
  deleteProfileImage(): Observable<any> {
    const userId = this.getUserId();
    return this.http.delete<any>(`${this.baseUrl}/${userId}/image`).pipe(
      tap(() => {
        const existing = localStorage.getItem('user');
        if (existing) {
          const parsed = JSON.parse(existing);
          delete parsed.profilePicture;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      })
    );
  }
}
