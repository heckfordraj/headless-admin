import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ServerService } from '../shared/server.service';
import { Page } from '../shared/page';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  pages$: Observable<Page[]>;

  constructor(private serverService: ServerService) {}

  updatePage(page: Page, newtitle: string) {
    // const newPage: Page = { title: newtitle, id: slugify(newtitle) };
    // this.serverService.updatePage(newPage, page.id);
  }

  addPage(title: string) {
    const newPage: Page = { title: title, id: this.serverService.createId() };
    this.serverService.addPage(newPage);
  }

  ngOnInit() {
    this.pages$ = this.serverService.getCollection('pages');
  }
}
