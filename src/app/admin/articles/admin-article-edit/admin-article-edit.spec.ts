import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleEdit } from './admin-article-edit';

describe('ArticleEdit', () => {
  let component: ArticleEdit;
  let fixture: ComponentFixture<ArticleEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
