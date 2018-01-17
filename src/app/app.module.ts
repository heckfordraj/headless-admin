import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';

import { RoutingModule } from './routing.module';
import { ServerService } from './shared/server.service';
import { ImageService } from './editor/blocks/image/image.service';

import { AppComponent } from './app.component';
import { PagesComponent } from './pages/pages.component';
import { EditorComponent } from './editor/editor.component';
import { TextComponent } from './editor/blocks/text/text.component';
import { ImageComponent } from './editor/blocks/image/image.component';
import { BlocksComponent } from './editor/blocks/blocks.component';

@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    EditorComponent,
    TextComponent,
    ImageComponent,
    BlocksComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    HttpClientModule,
    RoutingModule
  ],
  providers: [ServerService, ImageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
