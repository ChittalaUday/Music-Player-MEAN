import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';
import { Song } from '../../services/song.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-song-card',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatDurationPipe, MatSnackBarModule],
  templateUrl: './song-card.component.html',
  styleUrls: ['./song-card.component.css']
})

export class SongCardComponent {
  @Input() song!: Song;
  @Input() isPlaying = false;
  @Input() isFavorite = false;
  @Input() isInLibrary = false;
  @Input() userId!: string;

  @Output() play = new EventEmitter<Song>();
  @Output() pause = new EventEmitter<Song>();
  @Output() toggleFavorite = new EventEmitter<Song>();
  @Output() addToLibrary = new EventEmitter<Song>();
  @Output() removeFromLibrary = new EventEmitter<Song>();
  @Output() addToPlaylist = new EventEmitter<Song>();

  togglePlay(event: Event): void {
    event.stopPropagation();
    if (this.isPlaying) {
      this.pause.emit(this.song);
    } else {
      this.play.emit(this.song);
    }
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.song);
  }

  toggleLibrary(event: Event): void {
    event.stopPropagation();
    if (this.isInLibrary) {
      this.removeFromLibrary.emit(this.song);
    } else {
      this.addToLibrary.emit(this.song);
    }
  }

  onAddToPlaylist(event: Event): void {
    event.stopPropagation();
    this.addToPlaylist.emit(this.song);
  }


  getPrimaryArtist(): string {
    return this.song.artist?.trim() || (this.song.artists?.[0] || 'Unknown Artist');
  }

}
