import { Component, OnInit } from '@angular/core';
import { ServerService } from './server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private serverService: ServerService
  ){}

  pages: string[];


  ngOnInit(){

    this.serverService.getPages()
    .subscribe((res: string[]) => {

      console.dir(res);
      this.pages = res;
    })
  }

}
