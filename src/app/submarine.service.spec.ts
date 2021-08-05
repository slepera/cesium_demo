import { TestBed } from '@angular/core/testing';

import { SubmarineService } from './submarine.service';

describe('SubmarineService', () => {
  let service: SubmarineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmarineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
