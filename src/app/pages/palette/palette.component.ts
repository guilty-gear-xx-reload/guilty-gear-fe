import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PaletteService} from "../../services/palette-service";
import {PaletteColors} from "../../models/palette-colors";
import {SpriteColorIndexes} from "../../models/sprite-color-indexes";
import {PaletteColorsCommand} from "../../models/palette-colors-command";
import { NzMessageService } from 'ng-zorro-antd/message';
import {PaletteColorsWithName} from "../../models/palette-colors-with-name";
import { Rgba } from 'src/app/models/rgba';
import { NzSelectComponent } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css']
})
export class PaletteComponent implements OnInit, AfterViewInit {
  // static variables
  paletteScale = 9; // increase this to change size of the palette
  originalPaletteWidth = 8;
  originalPaletteHeight = 32;
  paletteWidth = this.originalPaletteWidth * this.paletteScale;
  paletteHeight = this.originalPaletteHeight * this.paletteScale;
  delta = this.paletteWidth / this.originalPaletteWidth;

  // others
  defaultPaletteColors: PaletteColors;
  spriteColorIndexes: SpriteColorIndexes;
  characterNames: string[];
  spritePositions: number[];
  selectedCharacterName: string;
  selectedSpritePosition: string;
  selectedCustomPalette: PaletteColorsWithName;
  numberOfPostures: string[];
  customPaletteName: string;

  isCharacterSelected: boolean;
  isModalVisible: boolean;
  customPalettes: PaletteColorsWithName[];
  static clickedPaletteIndex: number;
  @ViewChild('paletteCanvas')
  private paletteCanvas: ElementRef = {} as ElementRef;

  @ViewChild('spriteCanvas')
  private spriteCanvas: ElementRef = {} as ElementRef;
  @ViewChild('colorPicker')
  private colorPicker: ElementRef = {} as ElementRef;
  @ViewChild('customPaletteInput')
  private customPaletteInput: ElementRef = {} as ElementRef;

  constructor(private paletteService: PaletteService, private messageService: NzMessageService) {
  }

  ngOnInit(): void {
    this.getCharacterNames();
  }

  ngAfterViewInit(): void {
    this.paletteCanvas.nativeElement.addEventListener('click', this.clickPaletteAndGetRgbColor.bind(this));
    this.colorPicker.nativeElement.addEventListener('input', this.onInputPaletteColor.bind(this));
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
      this.drawPalette(this.defaultPaletteColors.rgba);
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
    if(customPalette === undefined || customPalette === null) {
      this.selectedCustomPalette = undefined;
      this.customPaletteName = undefined;
    } else {
      this.drawPalette(customPalette.rgba);
      this.defaultPaletteColors.rgba = customPalette.rgba;
      this.drawSprite();
      this.customPaletteInput.nativeElement.value = customPalette.paletteName;
      this.customPaletteName = customPalette.paletteName;
    }
  }

  public getSprite(postureId: string) {
    this.paletteService.getSprite(this.selectedCharacterName, postureId).subscribe(data => {
      this.spriteColorIndexes = data;
      this.drawSprite()
    }, error => {
      console.log(error);
    });
  }


  public drawPalette(rgba: Rgba[]) {
    const context = this.paletteCanvas.nativeElement.getContext('2d');

    let index = 0;
    for (let i = 0; i < this.paletteHeight / this.paletteScale; i++) {
      for (let j = 0; j < this.paletteWidth / this.paletteScale; j++) {
        context.fillStyle = this.convertRgbaToCss(index++, rgba);
        context.fillRect(
          this.delta * j,
          this.delta * i,
          this.delta,
          this.delta
        );
      }
    }
    this.paletteCanvas.nativeElement.context = context;
  }

  public convertRgbaToCss(index, rgba: Rgba[]) {
    const paletteRgba = rgba[index];
    return 'rgba(' + paletteRgba.r + ', ' + paletteRgba.g + ', ' + paletteRgba.b + ', 1.0)';
  }

  public drawSprite() {
    var startTime = performance.now();
    const imgWidth = this.spriteColorIndexes.width;
    const imgHeight = this.spriteColorIndexes.height;
    this.spriteCanvas.nativeElement.width = imgWidth;
    this.spriteCanvas.nativeElement.height = imgHeight;

    var context = this.spriteCanvas.nativeElement.getContext('2d');

    var image = context.createImageData(imgWidth, imgHeight);
    var data = image.data;

    // draw sprite
    var x = 0;
    var y = 0;
    this.spriteColorIndexes.spriteColorIndexes.forEach(indexToPalette => {
      if (y == imgHeight) {
        return;
      }
      drawPixel(this.defaultPaletteColors, x, y, indexToPalette);
      x++;
      if (x == imgWidth) {
        x = 0;
        y++;
      }
    });
    swapBuffer();

    var endTime = performance.now();
    console.log(`Drawing took ${endTime - startTime} milliseconds`);

    function drawPixel(palette, x, y, indexToPalette) {
      var roundedX = Math.round(x);
      var roundedY = Math.round(y);

      var index = 4 * (imgWidth * roundedY + roundedX);

      data[index + 0] = palette.rgba[indexToPalette].r;
      data[index + 1] = palette.rgba[indexToPalette].g;
      data[index + 2] = palette.rgba[indexToPalette].b;
      data[index + 3] = 255;
    }

    function swapBuffer() {
      context.putImageData(image, 0, 0);
    }
  }

  clickPaletteAndGetRgbColor(event) {
    var elemLeft = this.paletteCanvas.nativeElement.offsetLeft + this.paletteCanvas.nativeElement.clientLeft;
    var elemTop = this.paletteCanvas.nativeElement.offsetTop + this.paletteCanvas.nativeElement.clientTop;
    var x = event.pageX - elemLeft;
    var y = event.pageY - elemTop;

    let context = this.paletteCanvas.nativeElement.getContext('2d');
    let pixelData = context.getImageData(x, y, 1, 1).data;

    var r = pixelData[0];
    var g = pixelData[1];
    var b = pixelData[2];

    console.log("r=" + r + ", g=" + g + ", b=" + b);
    PaletteComponent.clickedPaletteIndex = this.calculateClickedPaletteIndex(x, y);
    console.log(PaletteComponent.clickedPaletteIndex);
    this.colorPicker.nativeElement.value = this.rgbToHex(r, g, b);
    this.colorPicker.nativeElement.click();
  }

  public getEventLocation(element, event) {
    var position = this.getElementPosition(element);
    return {
      x: (event.pageX - position.x),
      y: (event.pageY - position.y)
    };
  }

  public getElementPosition(element) {
    var rect = element.getBoundingClientRect();
    return {x: rect.left, y: rect.top};
  }


  public calculateClickedPaletteIndex(x, y) {
    let roundedUpX = Math.ceil(x / this.paletteScale);
    let roundedDownY = Math.floor(y / this.paletteScale);
    return this.originalPaletteWidth * roundedDownY + roundedUpX - 1;
  }

  rgbToHex(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  onInputPaletteColor(event) {
    console.log("elo");
    var colorPickerRgba = this.hexToRgb(event.target.value)
    var selectedPaletteIndex = PaletteComponent.clickedPaletteIndex;
    this.defaultPaletteColors.rgba[selectedPaletteIndex].r = colorPickerRgba.r;
    this.defaultPaletteColors.rgba[selectedPaletteIndex].g = colorPickerRgba.g;
    this.defaultPaletteColors.rgba[selectedPaletteIndex].b = colorPickerRgba.b;
    this.drawSprite();

    var context = this.paletteCanvas.nativeElement.getContext('2d');

    context.fillStyle = 'rgb(' + colorPickerRgba.r + ',' + colorPickerRgba.g + ',' + colorPickerRgba.b + ')';
    var coordsByIndex = this.calculateCoordsByPaletteIndex(selectedPaletteIndex);
    context.fillRect(
      this.delta * coordsByIndex.x,
      this.delta * coordsByIndex.y,
      this.delta,
      this.delta
    );
    this.paletteCanvas.nativeElement.getContext('2d').context = context;
  }
  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateCoordsByPaletteIndex(index) {
    return {
      x: index % this.originalPaletteWidth,
      y: Math.trunc(index / this.originalPaletteWidth)
    }
  }

  handleCancel() {
    this.isModalVisible = false;
  }

  handleOk() {
    if(this.selectedCustomPalette === undefined || this.selectedCustomPalette === null) {
      var paletteColorsCommand = new PaletteColorsCommand();
      paletteColorsCommand.rgba = this.defaultPaletteColors.rgba;
      paletteColorsCommand.paletteName = this.customPaletteName;
      paletteColorsCommand.characterName = this.selectedCharacterName;
      this.paletteService.savePalette(paletteColorsCommand).subscribe(data => {
        this.messageService.success("Palette has been saved correctly!");
        this.isModalVisible = false;
        var newPaletteColorsWithName = new PaletteColorsWithName();
        newPaletteColorsWithName.id = data;
        newPaletteColorsWithName.paletteName = paletteColorsCommand.paletteName;
        newPaletteColorsWithName.rgba = paletteColorsCommand.rgba;
        this.customPalettes.push(newPaletteColorsWithName);
        this.selectedCustomPalette = newPaletteColorsWithName;
      }, error => {
        console.log(error);
      });
    }
    else {
      this.updatePalette();
    }
  }

  updatePalette() {
    var paletteColorsCommand = new PaletteColorsCommand();
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
      var index = this.customPalettes.findIndex(x => x.id == id);
      this.customPalettes.splice(index, 1);
      this.drawPalette(this.defaultPaletteColors.rgba); // TODO fix draw sprite
    }, error => {
      console.log(error);
    });
  }
}
