import { TestBed } from '@angular/core/testing';

import { WebsocketChartService } from './websocket-chart.service';

describe('WebsocketChartService', () => {
  let service: WebsocketChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
