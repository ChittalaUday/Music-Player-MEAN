import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDuration'
})
export class FormatDurationPipe implements PipeTransform {
  transform(seconds: number): string {
    if (!seconds && seconds !== 0) return 'Unknown';

    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = Math.floor(seconds % 60);

    // Format: MM:SS
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
