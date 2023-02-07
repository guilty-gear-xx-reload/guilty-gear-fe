import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PaletteService} from "../../services/palette-service";
import {PaletteColors} from "../../models/palette-colors";
import {SpriteColorIndexes} from "../../models/sprite-color-indexes";
import {PaletteColorsCommand} from "../../models/palette-colors-command";
import {NzMessageService} from 'ng-zorro-antd/message';
import {PaletteColorsWithName} from "../../models/palette-colors-with-name";
import {CanvasComponent} from "../canvas/canvas.component";

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css']
})
export class PaletteComponent implements OnInit {
  DEFAULT_POSTURE_POSITION = "0";

  defaultPaletteColors: PaletteColors;

  customPaletteColors: PaletteColors;

  spriteColorIndexes: SpriteColorIndexes;
  characterNames: string[];
  selectedCharacterName: string;
  selectedSpritePosition: string;
  selectedCustomPalette: PaletteColorsWithName;
  postures: string[];
  customPaletteName: string;

  isCharacterSelected: boolean;
  isModalVisible: boolean;
  customPalettes: PaletteColorsWithName[] = [];

  @ViewChild(CanvasComponent, {static: false})
  canvasComponent: CanvasComponent;

  @ViewChild('customPaletteInput')
  private customPaletteInput: ElementRef = {} as ElementRef;
  test: PaletteColorsWithName;

  constructor(private paletteService: PaletteService, private messageService: NzMessageService) {
  }

  ngOnInit(): void {
    this.loadCharacterNames();
  }


  public loadAndDrawSelectedCharacter(characterName: string) {
    this.isCharacterSelected = true;
    this.selectedCustomPalette = null;
    this.customPalettes = null;
    this.customPaletteName = null;
    this.selectedCharacterName = characterName;
    this.loadCustomPalettesByCharacterName(characterName);
    this.paletteService.getPaletteByCharacterName(characterName).subscribe(data => {
      this.defaultPaletteColors = JSON.parse(JSON.stringify(data));
      this.customPaletteColors = data;
      this.canvasComponent.drawPalette(data.rgba);
      this.loadAndDrawSprite(this.DEFAULT_POSTURE_POSITION, this.defaultPaletteColors);
      this.selectedSpritePosition = this.DEFAULT_POSTURE_POSITION;

      this.paletteService.getPosturesByCharacterName(characterName).subscribe(data => {
        this.postures = new Array(data);
        for (let i = 0; i < data; i++) {
          this.postures[i] = i.toString();
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }

  public drawCustomPaletteAndSprite(customPalette: PaletteColorsWithName) {
    console.log(customPalette)
    if (customPalette === undefined || customPalette === null) {
      this.selectedCustomPalette = null;
      this.customPaletteName = null;
      this.customPaletteColors = JSON.parse(JSON.stringify(this.defaultPaletteColors));
      this.canvasComponent.drawPalette(this.defaultPaletteColors.rgba);
      this.canvasComponent.drawSprite(this.spriteColorIndexes, this.defaultPaletteColors);
    } else {
      this.canvasComponent.drawPalette(customPalette.rgba);
      this.customPaletteColors.rgba = customPalette.rgba;
      this.canvasComponent.drawSprite(this.spriteColorIndexes, this.customPaletteColors);
      this.customPaletteInput.nativeElement.value = customPalette.paletteName;
      this.customPaletteName = customPalette.paletteName;
    }
  }

  public loadAndDrawSprite(postureId: string, paletteColors: PaletteColors) {
    this.paletteService.getSprite(this.selectedCharacterName, postureId).subscribe(data => {
      this.spriteColorIndexes = data;
      this.canvasComponent.drawSprite(this.spriteColorIndexes, paletteColors)
    }, error => {
      console.log(error);
    });
  }

  public saveCustomPalette() {

    if (this.selectedCustomPalette === undefined || this.selectedCustomPalette === null) {
      let paletteColorsCommand = new PaletteColorsCommand();
      paletteColorsCommand.rgba = this.customPaletteColors.rgba;
      paletteColorsCommand.paletteName = this.customPaletteName;
      paletteColorsCommand.characterName = this.selectedCharacterName;
      this.paletteService.savePalette(paletteColorsCommand).subscribe(data => {
        console.log("FOR")
        for(let i = 0;i<this.customPalettes.length ;i++){
          console.log(this.customPalettes[i].rgba[0]);
        }
        this.messageService.success("Palette has been saved correctly!");
        this.isModalVisible = false;
        let newPaletteColorsWithName = {
          id: data,
          paletteName: paletteColorsCommand.paletteName,
          rgba: paletteColorsCommand.rgba
        };
        // newPaletteColorsWithName.id = data;
        // newPaletteColorsWithName.paletteName = paletteColorsCommand.paletteName;
        // newPaletteColorsWithName.rgba = paletteColorsCommand.rgba;
        //this.customPalettes.push(newPaletteColorsWithName); //todo napisuje wszystkie wartosci w tablicy
        console.log("NEW" )
        console.log(newPaletteColorsWithName.rgba[0])
        this.customPalettes = [...this.customPalettes, newPaletteColorsWithName];

        // this.loadAndDrawSelectedCharacter(this.selectedCharacterName);
        this.selectedCustomPalette = newPaletteColorsWithName;
      }, error => {
        console.log(error);
      });
    } else {
      this.updateCustomPalette();
    }
  }

  public deleteCustomPalette(id: number) {
    this.paletteService.deletePalette(id).subscribe(data => {
      this.messageService.success("Palette has been deleted correctly!");
      this.customPaletteName = null;
      this.selectedCustomPalette = null;
      const index = this.customPalettes.findIndex(x => x.id == id);
      this.customPalettes.splice(index, 1);
      this.canvasComponent.drawPalette(this.defaultPaletteColors.rgba);
      this.customPaletteColors = JSON.parse(JSON.stringify(this.defaultPaletteColors));
      this.loadAndDrawSprite(this.DEFAULT_POSTURE_POSITION, this.defaultPaletteColors);
    }, error => {
      console.log(error);
    });
  }

  loadCharacterNames() {
    this.paletteService.getCharacterNames().subscribe(data => {
      this.characterNames = data;
    }, error => {
      console.log(error);
    });
  }


  loadCustomPalettesByCharacterName(characterName: string) {
    this.paletteService.getCustomPalettesByCharacterName(characterName).subscribe(data => {
      this.customPalettes = data;
    }, error => {
      console.log(error);
    });
  }

  updateCustomPalette() {
    const paletteColorsCommand = new PaletteColorsCommand();
    paletteColorsCommand.rgba = this.customPaletteColors.rgba;
    paletteColorsCommand.paletteName = this.customPaletteName;
    paletteColorsCommand.characterName = this.selectedCharacterName;
    this.paletteService.updatePalette(paletteColorsCommand, this.selectedCustomPalette.id).subscribe(data => {
      this.messageService.success("Palette has been updated correctly!");
      this.isModalVisible = false;
      this.selectedCustomPalette.paletteName = this.customPaletteName;
    }, error => {
      console.log(error);
    });
  }


}
