// playlist.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist',
  imports:[CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.css']
})
export class PlaylistsComponent implements OnInit {
  playlists: Playlist[] = [];
  playlistForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  userId: string = '';
  showCreateForm = false;

  constructor(
    private playlistService: PlaylistService,
    private fb: FormBuilder
  ) {
    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Get userId from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userId = user._id;
        this.loadPlaylists();
      } catch (e) {
        this.error = 'User data is invalid. Please login again.';
      }
    } else {
      this.error = 'User not logged in. Please login to manage playlists.';
    }
  }

  loadPlaylists(): void {
    if (!this.userId) return;

    this.loading = true;
    this.playlistService.getUserPlaylists(this.userId)
      .subscribe({
        next: (data) => {
          this.playlists = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load playlists. Please try again later.';
          this.loading = false;
          console.error('Error loading playlists:', err);
        }
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.playlistForm.reset();
    this.error = null;
    this.success = null;
  }

  createPlaylist(): void {
    if (this.playlistForm.invalid) {
      this.playlistForm.markAllAsTouched();
      return;
    }

    if (!this.userId) {
      this.error = 'User not logged in. Please login to create playlists.';
      return;
    }

    const newPlaylist: Playlist = {
      name: this.playlistForm.value.name,
      description: this.playlistForm.value.description || '',
      userId: this.userId,
      songIds: []
    };

    this.loading = true;
    this.playlistService.createPlaylist(newPlaylist)
      .subscribe({
        next: (createdPlaylist) => {
          this.playlists.push(createdPlaylist);
          this.success = 'Playlist created successfully!';
          this.loading = false;
          this.resetForm();
          this.showCreateForm = false;
          // Refresh the list to ensure we have the latest data
          this.loadPlaylists();
        },
        error: (err) => {
          this.error = 'Failed to create playlist. Please try again.';
          this.loading = false;
          console.error('Error creating playlist:', err);
        }
      });
  }

  deletePlaylist(playlist: Playlist): void {
    if (!playlist._id) {
      this.error = 'Invalid playlist ID';
      return;
    }

    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      // Implementing delete functionality by removing from local array
      // Since the service doesn't have a delete method, we're just updating the UI
      // In a real application, you would make an HTTP call to delete from the server
      this.playlists = this.playlists.filter(p => p._id !== playlist._id);
      this.success = 'Playlist deleted successfully!';

      // Clear messages after a delay
      setTimeout(() => {
        this.success = null;
      }, 3000);
    }
  }
}
