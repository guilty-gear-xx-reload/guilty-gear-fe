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
  defaultPaletteColors: PaletteColors;
  spriteColorIndexes: SpriteColorIndexes;
  characterNames: string[];
  selectedCharacterName: string;
  selectedSpritePosition: string;
  selectedCustomPalette: PaletteColorsWithName;
  numberOfPostures: string[];
  customPaletteName: string;

  isCharacterSelected: boolean;
  isModalVisible: boolean;
  customPalettes: PaletteColorsWithName[];

  @ViewChild(CanvasComponent, {static: false})
  canvasComponent: CanvasComponent;

  @ViewChild('customPaletteInput')
  private customPaletteInput: ElementRef = {} as ElementRef;

  constructor(private paletteService: PaletteService, private messageService: NzMessageService) {
  }

  ngOnInit(): void {
    this.getCharacterNames();
  }


  public savePalette() {
    this.isModalVisible = true;
  }

  public getCharacterNames() {
    this.paletteService.getCharacterNames().subscribe(data => {
      this.characterNames = data;
    }, error => {
      console.log(error);
    });
  }


  public getCustomPalettes() {
    this.paletteService.getCustomPalettes(this.selectedCharacterName).subscribe(data => {
      this.customPalettes = data;
    }, error => {
      console.log(error);
    });
  }

  public getDefaultPalette(characterName: string) {
    this.isCharacterSelected = true;
    this.selectedCustomPalette = undefined;
    this.customPalettes = undefined;
    this.customPaletteName = undefined;
    this.selectedCharacterName = characterName;
    this.getCustomPalettes();

    this.paletteService.getPalette(characterName).subscribe(data => {
      this.defaultPaletteColors = data;
      this.canvasComponent.drawPalette(this.defaultPaletteColors.rgba);
      this.getSprite("0");
      this.selectedSpritePosition = "0";

      this.paletteService.getNumberOfPostures(characterName).subscribe(data => {
        this.numberOfPostures = new Array(data);
        for (let i = 0; i < data; i++) {
          this.numberOfPostures[i] = i.toString();
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }

  public getCustomPalette(customPalette: PaletteColorsWithName) {
    if (customPalette === undefined || customPalette === null) {
      this.selectedCustomPalette = undefined;
      this.customPaletteName = undefined;
    } else {
      this.canvasComponent.drawPalette(customPalette.rgba);
      this.defaultPaletteColors.rgba = customPalette.rgba;
      this.canvasComponent.drawSprite(this.spriteColorIndexes);
      this.customPaletteInput.nativeElement.value = customPalette.paletteName;
      this.customPaletteName = customPalette.paletteName;
    }
  }

  public getSprite(postureId: string) {
    this.paletteService.getSprite(this.selectedCharacterName, postureId).subscribe(data => {
      this.spriteColorIndexes = data;
      this.canvasComponent.drawSprite(this.spriteColorIndexes)
    }, error => {
      console.log(error);
    });
  }


  handleCancel() {
    this.isModalVisible = false;
  }

  handleOk() {
    if (this.selectedCustomPalette === undefined || this.selectedCustomPalette === null) {
      const paletteColorsCommand = new PaletteColorsCommand();
      paletteColorsCommand.rgba = this.defaultPaletteColors.rgba;
      paletteColorsCommand.paletteName = this.customPaletteName;
      paletteColorsCommand.characterName = this.selectedCharacterName;
      this.paletteService.savePalette(paletteColorsCommand).subscribe(data => {
        this.messageService.success("Palette has been saved correctly!");
        this.isModalVisible = false;
        const newPaletteColorsWithName = new PaletteColorsWithName();
        newPaletteColorsWithName.id = data;
        newPaletteColorsWithName.paletteName = paletteColorsCommand.paletteName;
        newPaletteColorsWithName.rgba = paletteColorsCommand.rgba;
        this.customPalettes.push(newPaletteColorsWithName);
        this.selectedCustomPalette = newPaletteColorsWithName;
      }, error => {
        console.log(error);
      });
    } else {
      this.updatePalette();
    }
  }

  updatePalette() {
    const paletteColorsCommand = new PaletteColorsCommand();
    paletteColorsCommand.rgba = this.defaultPaletteColors.rgba;
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

  deletePalette(id: number) {
    this.paletteService.deletePalette(id).subscribe(data => {
      this.messageService.success("Palette has been deleted correctly!");
      this.customPaletteName = undefined;
      this.selectedCustomPalette = undefined;
      const index = this.customPalettes.findIndex(x => x.id == id);
      this.customPalettes.splice(index, 1);
      this.canvasComponent.drawPalette(this.defaultPaletteColors.rgba); // TODO fix draw sprite
    }, error => {
      console.log(error);
    });
  }
}
