import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {PaletteColors} from '../models/palette-colors';
import {SpriteColorIndexes} from '../models/sprite-color-indexes';
import {PaletteColorsCommand} from '../models/palette-colors-command';
import {PaletteColorsWithName} from '../models/palette-colors-with-name';

@Injectable({
  providedIn: 'root',
})
export class PaletteService {
  private baseUrl = `${environment.ggxxlobbyRestapi}`;

  constructor(private http: HttpClient) {
  }

  public savePalette(paletteColorsCommand: PaletteColorsCommand): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/palettes/custom`, paletteColorsCommand, {
      params: null,
    });
  }

  public updatePalette(paletteColorsCommand: PaletteColorsCommand, id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/palettes/custom/${id}`, paletteColorsCommand, {
      params: null,
    });
  }

  public getPaletteByCharacterName(characterName: string): Observable<PaletteColors> {
    return this.http.get<PaletteColors>(`${this.baseUrl}/palettes/default/${characterName}`, {
      params: null,
    });
  }

  public deletePalette(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/palettes/custom/${id}`, {
      params: null,
    });
  }

  public getSprite(characterName: string, postureId: string): Observable<SpriteColorIndexes> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('postureId', postureId);
    return this.http.get<SpriteColorIndexes>(`${this.baseUrl}/sprites/${characterName}`, {
      params: httpParams,
    });
  }


  public getCharacterNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/characters/names`, {
      params: null,
    });
  }

  public getCustomPalettesByCharacterName(characterName: string): Observable<PaletteColorsWithName[]> {
    return this.http.get<PaletteColorsWithName[]>(`${this.baseUrl}/palettes/customm/${characterName}`, {
      params: null,
    });
  }

  public getPosturesByCharacterName(characterName: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/characters/postures/${characterName}/total-elements`, {
      params: null,
    });
  }
}
