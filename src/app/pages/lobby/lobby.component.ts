import { Component, OnInit } from '@angular/core';
import { PlayerLobby } from 'src/app/models/player-lobby';
import { LobbyService } from 'src/app/services/lobby-service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  playerLobbies: PlayerLobby [];
  constructor(private lobbyService : LobbyService) { }

  ngOnInit(): void {
    this.lobbyService.getLobbyPlayers().subscribe(data =>{
      this.playerLobbies = data;
    },(error=>{
      console.log(error);
    }))
  }
}
