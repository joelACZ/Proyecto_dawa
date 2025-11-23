import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudSolicitudes } from './crud-solicitudes';

describe('CrudSolicitudes', () => {
  let component: CrudSolicitudes;
  let fixture: ComponentFixture<CrudSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudSolicitudes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudSolicitudes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
