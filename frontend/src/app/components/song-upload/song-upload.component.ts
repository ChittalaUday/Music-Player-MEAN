import { Component } from '@angular/core';
import { SongService } from '../../services/song.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-song',
  imports: [CommonModule],
  templateUrl: './song-upload.component.html',
  styleUrls: ['./song-upload.component.css']
})
export class UploadSongComponent {
  showUploadPopup = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  uploadMessage = '';


  constructor(private songService: SongService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadSong() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate progress for demo purposes
    const interval = setInterval(() => {
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.uploadMessage = 'Upload complete!';
      } else {
        this.uploadProgress += 5;
      }
    }, 200);
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
    this.selectedFile = null;
    this.uploadMessage = '';
    this.uploadProgress = 0;
  }

}
