import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudProfesionales } from './crud-profesionales';

describe('CrudProfesionales', () => {
  let component: CrudProfesionales;
  let fixture: ComponentFixture<CrudProfesionales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudProfesionales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudProfesionales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
