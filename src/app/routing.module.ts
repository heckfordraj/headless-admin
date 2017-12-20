import { NgModule } from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { PagesComponent } from './pages/pages.component';
import { EditorComponent } from './editor/editor.component';


const routes: Routes = [
  { path: 'pages', component: PagesComponent },
  { path: 'page/:id', component: EditorComponent },
  { path: 'page', redirectTo: '/pages', pathMatch: 'full' },
  { path: '', redirectTo: '/pages', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutingModule { }
