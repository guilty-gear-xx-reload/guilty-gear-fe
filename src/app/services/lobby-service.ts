import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PlayerLobby } from "../models/player-lobby";

@Injectable({
    providedIn: "root",
})
export class LobbyService {
    private baseUrl = `${environment.ggxxlobbyRestapi}`;
    constructor(private http: HttpClient) { }

    public getLobbyPlayers(): Observable<PlayerLobby[]> {
        return this.http.get<PlayerLobby[]>(`${this.baseUrl}/lobby`, {
            params: null,
        });
    }
}