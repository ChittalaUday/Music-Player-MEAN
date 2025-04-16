import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistPopupComponent } from './playlist-popup.component';

describe('PlaylistPopupComponent', () => {
  let component: PlaylistPopupComponent;
  let fixture: ComponentFixture<PlaylistPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
