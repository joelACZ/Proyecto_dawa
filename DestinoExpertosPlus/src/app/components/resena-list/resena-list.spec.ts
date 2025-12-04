import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenaList } from './resena-list';

describe('ResenaList', () => {
  let component: ResenaList;
  let fixture: ComponentFixture<ResenaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenaList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResenaList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
