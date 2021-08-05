import { TestBed } from '@angular/core/testing';

import { WebsocketSubmarineService } from './websocket-submarine.service';

describe('WebsocketSubmarineService', () => {
  let service: WebsocketSubmarineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketSubmarineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
