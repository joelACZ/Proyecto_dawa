import { TestBed } from '@angular/core/testing';

import { ServClientesJson } from './cliente-service';

describe('ServClientesJson', () => {
  let service: ServClientesJson;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServClientesJson);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
