import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudServicios } from './crud-servicios';

describe('CrudServicios', () => {
  let component: CrudServicios;
  let fixture: ComponentFixture<CrudServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudServicios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
