import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private baseUrl = `${environment.ggxxlobbyRestapi}`;

    constructor(private http: HttpClient,) { }

    authenticate(model: any) :Observable<any>{
        return this.http.post<any>(`${this.baseUrl}/login`, {
            username: model.username,
            password: model.password
        })
    }

    isUserLoggedIn() {
        let user = sessionStorage.getItem('token')
        return !(user === null)
    }

    logOut() {
        sessionStorage.removeItem('token')
    }
}