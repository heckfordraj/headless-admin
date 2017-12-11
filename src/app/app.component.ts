import { Component, OnInit } from '@angular/core';

import { ServerService } from './server.service';
import { Page } from './page';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private serverService: ServerService
  ){}

  pages: Page[] = [];


  ngOnInit(){

    this.serverService.getPages()
    .subscribe((page: Page) => {

      console.log(page);
      this.pages.push(page);
    })
  }

}
