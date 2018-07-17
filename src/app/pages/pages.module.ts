import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { PagesComponent } from './pages.component';

const routes: Routes = [{ path: '', component: PagesComponent }];

@NgModule({
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [PagesComponent]
})
export class PagesModule {}
