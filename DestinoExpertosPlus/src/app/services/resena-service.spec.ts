import { TestBed } from '@angular/core/testing';

import { ServResenasJson } from './resena-service';

describe('ResenaService', () => {
  let service: ServResenasJson;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServResenasJson);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
