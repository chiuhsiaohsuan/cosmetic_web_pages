import { TestBed } from '@angular/core/testing';

import { AdminMember } from './admin-member';

describe('AdminMember', () => {
  let service: AdminMember;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminMember);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
