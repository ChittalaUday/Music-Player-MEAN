import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Song, SongService } from '../../services/song.service';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-song-info',
  standalone: true,
  imports: [FormsModule,FormatDurationPipe, CommonModule],
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.css']
})
export class SongInfoComponent {
  @Input() song!: Song;
  @Input() visible: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() play = new EventEmitter<Song>();
  @Output() addToLibrary = new EventEmitter<Song>();
  @Output() toggleFavorite = new EventEmitter<Song>();

  newTag: string = '';

  constructor(private songService: SongService) {}

  isFavorite(song: Song): boolean {
    return false; // Placeholder logic
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag) {
      this.songService.addTags(this.song._id!, [tag]).subscribe(() => {
        this.song.tags = [...(this.song.tags || []), tag];
        this.newTag = '';
      });
    }
  }

  removeTag(tag: string) {
    this.songService.removeTags(this.song._id!, [tag]).subscribe(() => {
      this.song.tags = this.song.tags?.filter(t => t !== tag);
    });
  }
}
