import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleAdd } from './admin-article-add';

describe('AdminArticleAdd', () => {
  let component: AdminArticleAdd;
  let fixture: ComponentFixture<AdminArticleAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
