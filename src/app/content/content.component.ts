import { Component, OnInit } from '@angular/core';

import { ServerService } from '../shared/server.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  content: any;

  constructor(private serverService: ServerService) {}

  ngOnInit() {
    this.serverService.getContent().subscribe(res => (this.content = res));
  }
}
