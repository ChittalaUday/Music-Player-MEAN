import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Import Router and ActivatedRoute
import { RouterModule } from '@angular/router';
import { UploadSongComponent } from '../song-upload/song-upload.component';
import { PlaylistService, Playlist } from '../../services/playlist.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true, // Mark as standalone component
  imports: [CommonModule, RouterModule,UploadSongComponent] // Import necessary modules directly in the component
})
export class SidebarComponent implements OnInit {
  showUploader = false;
  loadingPlaylists = false;
  playlistError: string | null = null;

  menuItems = [
    { icon: 'home', label: 'Home', link: '/home', active: false },
    { icon: 'search', label: 'Search', link: '/search', active: false },
    { icon: 'library_music', label: 'Your Library', link: '/library', active: false },
    { icon: 'favorite', label: 'Liked Songs', link: '/liked', active: false },
    { icon: 'person', label: 'Profile', link: '/profile', active: false }
  ];
  playlists: Playlist[] = [];
  constructor(
    private router: Router,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    this.setActiveItemBasedOnRoute();
    this.loadUserPlaylists();
  }

  loadUserPlaylists(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const userId = user._id;

        this.playlistService.getUserPlaylists(userId).subscribe({
          next: (data) => {
            this.playlists = data;
          },
          error: (err) => {
            console.error('Failed to load playlists', err);
          }
        });
        console.log(this.playlists);
      } catch (e) {
        console.error('Invalid user data in localStorage');
      }
    }
  }


  setActiveItem(item: any): void {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }

  setActiveItemBasedOnRoute(): void {
    const currentRoute = this.router.url; // Get the current route
    this.menuItems.forEach(menuItem => {
      if (menuItem.link === currentRoute) {
        menuItem.active = true; // Mark as active if it matches the current route
      }
    });
  }

  toggleUploader(): void {
    this.showUploader = !this.showUploader;
  }
}
