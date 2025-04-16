import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/song.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-bottom-music-player',
  imports:[NgIf],
  standalone: true,
  templateUrl: './bottom-music-player.component.html',
  styleUrls: ['./bottom-music-player.component.css']
})
export class BottomMusicPlayerComponent implements OnInit {
  currentSong: Song | null = null;
  audio = new Audio();
  isPlaying = false;
  progress = 45; // 0–100%

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.currentSong$.subscribe(song => {
      if (song) {
        this.currentSong = song;
        this.playSong(song);
      }
    });

  }

  playSong(song: Song) {
    this.audio.src = song.fileUrl!;
    this.audio.load();
    this.audio.play();
  }

  togglePlayPause() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

}
