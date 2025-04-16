import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from './song.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio = new Audio();
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);

  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();

  constructor() {
    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
    });
  }

  /** Set the current song without playing it */
  setSong(song: Song): void {
    const current = this.currentSongSubject.value;

    // Stop current playback
    this.audio.pause();
    this.isPlayingSubject.next(false);

    if (current?._id !== song._id) {
      this.audio.src = song.fileUrl || "";
      this.audio.load();
      this.currentSongSubject.next(song);
    }
  }

  togglePlay(): void {
    if (!this.audio.src) return;

    if (this.audio.paused) {
      this.audio.play();
      this.isPlayingSubject.next(true);
    } else {
      this.audio.pause();
      this.isPlayingSubject.next(false);
    }
  }

  pause(): void {
    this.audio.pause();
    this.isPlayingSubject.next(false);
  }

  isCurrentSong(song: Song): boolean {
    const current = this.currentSongSubject.value;
    return current?._id === song._id;
  }
}
