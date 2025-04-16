import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomMusicPlayerComponent } from './bottom-music-player.component';

describe('BottomMusicPlayerComponent', () => {
  let component: BottomMusicPlayerComponent;
  let fixture: ComponentFixture<BottomMusicPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomMusicPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomMusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
