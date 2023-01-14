import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from './security/authentication.guard';
import { PagePath } from './page-paths';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { PaletteComponent } from './pages/palette/palette.component';


const routes: Routes = [
  { path: PagePath.LOGIN, component: LoginComponent },
  {
    path: '', component: MainComponent, children: [
      { path: PagePath.LOBBY, component: LobbyComponent },
      { path: PagePath.PALETTES, component: PaletteComponent },
    
    ], canActivate: [AuthenticationGuard]
  }

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
