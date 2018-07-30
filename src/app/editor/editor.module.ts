import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { EditorComponent } from './editor.component';
import { BlocksComponent } from './blocks/blocks.component';
import { TextComponent } from './blocks/text/text.component';
import { ImageComponent } from './blocks/image/image.component';

const routes: Routes = [{ path: '', component: EditorComponent }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EditorComponent,
    BlocksComponent,
    ImageComponent,
    TextComponent
  ]
})
export class EditorModule {}
