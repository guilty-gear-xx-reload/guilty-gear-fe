import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../security/authentication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isCollapsed = false;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }
  logout(){
    this.authenticationService.logOut();
    this.router.navigate(['login']);
  }

  ngOnInit(): void {
  }

}
