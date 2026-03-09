import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ArrowButtonComponents', () => {
  let component: ArrowButtonComponents;
  let fixture: ComponentFixture<ArrowButtonComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowButtonComponents],
    }).compileComponents();

    fixture = TestBed.createComponent(ArrowButtonComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
