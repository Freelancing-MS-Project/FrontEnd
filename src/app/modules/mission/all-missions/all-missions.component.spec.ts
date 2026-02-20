import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AllMissionsComponent } from './all-missions.component';

describe('AllMissionsComponent', () => {
  let component: AllMissionsComponent;
  let fixture: ComponentFixture<AllMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllMissionsComponent],
      imports: [FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
