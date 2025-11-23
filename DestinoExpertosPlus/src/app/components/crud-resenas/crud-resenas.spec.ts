import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudResenas } from './crud-resenas';

describe('CrudResenas', () => {
  let component: CrudResenas;
  let fixture: ComponentFixture<CrudResenas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudResenas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudResenas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
