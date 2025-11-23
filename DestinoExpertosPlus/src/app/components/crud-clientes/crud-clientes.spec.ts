import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudClientes } from './crud-clientes';

describe('CrudClientes', () => {
  let component: CrudClientes;
  let fixture: ComponentFixture<CrudClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
