import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/security/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private baseUrl = `${environment.ggxxlobbyRestapi}`;
  validateForm!: FormGroup;
  model: any = {};
  sessionId: any = "";
  constructor(
    private router: Router,
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
  }

  login() {
    this.authenticationService.authenticate(this.model).subscribe(data => {
      sessionStorage.setItem('token', data.sessionId)
      this.router.navigate([''])
    }, (error) => {
      console.log("Błędne dane logowania")
    }); {
    }
  }

}