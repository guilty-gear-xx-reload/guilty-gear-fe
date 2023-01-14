import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './security/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isCollapsed = false;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }
  logout(){
    this.authenticationService.logOut();
    this.router.navigate(['login']);
  }
}
