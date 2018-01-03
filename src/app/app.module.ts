import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { RoutingModule } from './routing.module';
import { ServerService } from './server.service';

import { AppComponent } from './app.component';
import { PagesComponent } from './pages/pages.component';
import { EditorComponent } from './editor/editor.component';
import { TextComponent } from './editor/blocks/text/text.component';
import { ImageComponent } from './editor/blocks/image/image.component';

@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    EditorComponent,
    TextComponent,
    ImageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
