import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';

import { RoutingModule } from './routing.module';
import { LoggerService } from './shared/logger.service';

import { ServerService } from './shared/server.service';
import { ImageService } from './editor/blocks/image/image.service';

import { AppComponent } from './app.component';
import { PagesComponent } from './pages/pages.component';
import { EditorComponent } from './editor/editor.component';
import { TextComponent } from './editor/blocks/text/text.component';
import { ImageComponent } from './editor/blocks/image/image.component';
import { BlocksComponent } from './editor/blocks/blocks.component';
import { SlugifyPipe } from './shared/slugify.pipe';
import { HumanizePipe } from './shared/humanize.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    EditorComponent,
    TextComponent,
    ImageComponent,
    BlocksComponent,
    SlugifyPipe,
    HumanizePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    HttpClientModule,
    RoutingModule
  ],
  providers: [ServerService, ImageService, LoggerService, HumanizePipe],
  bootstrap: [AppComponent]
})
export class AppModule {}
