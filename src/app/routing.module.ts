import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'pages', loadChildren: 'app/pages/pages.module#PagesModule' },
  { path: 'page/:id', loadChildren: 'app/editor/editor.module#EditorModule' },
  { path: 'page', redirectTo: '/pages', pathMatch: 'full' },
  { path: '', redirectTo: '/pages', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class RoutingModule {}
