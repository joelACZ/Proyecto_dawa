import { TestBed } from '@angular/core/testing';

import { ServServiciosJson  } from './servicio-service';

describe('ServicioService', () => {
  let service: ServServiciosJson ;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServServiciosJson );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
