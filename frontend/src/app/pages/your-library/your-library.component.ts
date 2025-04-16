import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UploadSongComponent } from '../../components/song-upload/song-upload.component';
import { CommonModule } from '@angular/common';
import { PlaylistsComponent } from '../playlists/playlists.component';

@Component({
  standalone: true,
  imports: [PlaylistsComponent,CommonModule,UploadSongComponent],
  selector: 'app-your-library',
  templateUrl: './your-library.component.html',
  styleUrls: ['./your-library.component.css']
})
export class YourLibraryComponent {
  showUploader = false;
  showPlaylist = false;

  playlists = [
    { name: '🎉 Party Vibes', songs: 25 },
    { name: '🧘 Chill Beats', songs: 40 },
    { name: '🚗 Roadtrip Mix', songs: 18 }
  ];

  uploadSong(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      console.log('Uploading:', file.name);
     }
  }
  toggleUploader(): void {
    this.showUploader = !this.showUploader;
  }
  togglePLaylist():void{
    this.showPlaylist = !this.showPlaylist;
  }

  onPlaylistSubmit(event: { name: string }): void {
    console.log(`Playlist "${event.name}" has been created!`);
    // Here you would typically save the playlist to your backend
  }
  closePopup():void{

  }
}

