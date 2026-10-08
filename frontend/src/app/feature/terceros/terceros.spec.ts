import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Terceros } from './terceros';

describe('Terceros', () => {
  let component: Terceros;
  let fixture: ComponentFixture<Terceros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terceros],
    }).compileComponents();

    fixture = TestBed.createComponent(Terceros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
