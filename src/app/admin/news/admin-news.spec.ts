import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNews } from './admin-news';

describe('AdminNews', () => {
  let component: AdminNews;
  let fixture: ComponentFixture<AdminNews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNews],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
