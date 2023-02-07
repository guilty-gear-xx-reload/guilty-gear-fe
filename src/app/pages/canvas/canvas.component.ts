import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Rgba} from "../../models/rgba";
import {SpriteColorIndexes} from "../../models/sprite-color-indexes";
import {PaletteColors} from "../../models/palette-colors";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, AfterViewInit {
  PALETTE_SCALE = 9; // increase this to change size of the palette
  ORIGINAL_PALETTE_WIDTH = 8;
  ORIGINAL_PALETTE_HEIGHT = 32;
  PALETTE_WIDTH = this.ORIGINAL_PALETTE_WIDTH * this.PALETTE_SCALE;
  PALETTE_HEIGHT = this.ORIGINAL_PALETTE_HEIGHT * this.PALETTE_SCALE;
  DELTA = this.PALETTE_WIDTH / this.ORIGINAL_PALETTE_WIDTH;

  @Input()
  spriteColorIndexes: SpriteColorIndexes;

  @Input()
  customPaletteColors: PaletteColors;


  @ViewChild('paletteCanvas')
  private paletteCanvas: ElementRef = {} as ElementRef;

  @ViewChild('spriteCanvas')
  private spriteCanvas: ElementRef = {} as ElementRef;
  @ViewChild('colorPicker')
  private colorPicker: ElementRef = {} as ElementRef;
  static clickedPaletteIndex: number;

  constructor() {
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.paletteCanvas.nativeElement.addEventListener('click', this.clickPaletteAndGetRgbColor.bind(this));
    this.paletteCanvas.nativeElement.addEventListener('mousemove', this.hoverPaletteAndGetCurrentIndex.bind(this));
    this.colorPicker.nativeElement.addEventListener('input', this.onInputPaletteColor.bind(this));
  }


  public drawPalette(rgba: Rgba[]) {
    const context = this.paletteCanvas.nativeElement.getContext('2d');
    let index = 0;
    for (let i = 0; i < this.PALETTE_HEIGHT / this.PALETTE_SCALE; i++) {
      for (let j = 0; j < this.PALETTE_WIDTH / this.PALETTE_SCALE; j++) {
        context.fillStyle = this.convertRgbaToCss(index++, rgba);
        context.fillRect(
          this.DELTA * j,
          this.DELTA * i,
          this.DELTA,
          this.DELTA
        );
      }
    }
    this.paletteCanvas.nativeElement.context = context;
  }

  public drawSprite(spriteColorIndexes: SpriteColorIndexes, paletteColors: PaletteColors) {
    const imgWidth = spriteColorIndexes.width;
    const imgHeight = spriteColorIndexes.height;
    this.spriteCanvas.nativeElement.width = imgWidth;
    this.spriteCanvas.nativeElement.height = imgHeight;
    const context = this.spriteCanvas.nativeElement.getContext('2d');
    const image = context.createImageData(imgWidth, imgHeight);
    const data = image.data;

    // draw sprite
    let x = 0;
    let y = 0;
    spriteColorIndexes.spriteColorIndexes.forEach(indexToPalette => {
      if (y == imgHeight) {
        return;
      }
      drawPixel(paletteColors, x, y, indexToPalette);
      x++;
      if (x == imgWidth) {
        x = 0;
        y++;
      }
    });
    swapBuffer();

    function drawPixel(palette, x, y, indexToPalette) {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);

      const index = 4 * (imgWidth * roundedY + roundedX);

      data[index] = palette.rgba[indexToPalette].r;
      data[index + 1] = palette.rgba[indexToPalette].g;
      data[index + 2] = palette.rgba[indexToPalette].b;
      data[index + 3] = 255;
    }

    function swapBuffer() {
      context.putImageData(image, 0, 0);
    }
  }

  public clickPaletteAndGetRgbColor(event) {
    const elemLeft = this.paletteCanvas.nativeElement.offsetLeft + this.paletteCanvas.nativeElement.clientLeft;
    const elemTop = this.paletteCanvas.nativeElement.offsetTop + this.paletteCanvas.nativeElement.clientTop;
    const x = event.pageX - elemLeft;
    const y = event.pageY - elemTop;

    let context = this.paletteCanvas.nativeElement.getContext('2d');
    let pixelData = context.getImageData(x, y, 1, 1).data;

    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];

    CanvasComponent.clickedPaletteIndex = this.calculateClickedPaletteIndex(x, y);
    this.colorPicker.nativeElement.value = this.rgbToHex(r, g, b);
    this.colorPicker.nativeElement.click();
  }

  convertRgbaToCss(index, rgba: Rgba[]) {
    const paletteRgba = rgba[index];
    return 'rgba(' + paletteRgba.r + ', ' + paletteRgba.g + ', ' + paletteRgba.b + ', 1.0)';
  }


  random_rgba() {
    const o = Math.round, r = Math.random, s = 255;
    return {
      r: o(r() * s),
      g: o(r() * s),
      b: o(r() * s),
      a: r().toFixed(1)
    }
  }

  hoverPaletteAndGetCurrentIndex(event) {
    if (this.spriteColorIndexes === undefined || this.spriteColorIndexes === null) {
      return;
    }
    let spriteIndexes = this.spriteColorIndexes.spriteColorIndexes;
    // get hovered index
    const elemLeft = this.paletteCanvas.nativeElement.offsetLeft + this.paletteCanvas.nativeElement.clientLeft;
    const elemTop = this.paletteCanvas.nativeElement.offsetTop + this.paletteCanvas.nativeElement.clientTop;
    let x = event.pageX - elemLeft;
    let y = event.pageY - elemTop;
    const hoveredPaletteIndex = this.calculateClickedPaletteIndex(x, y);
    // prepare canvas
    let spriteWidth = this.spriteColorIndexes.width;
    let spriteHeight = this.spriteColorIndexes.height
    const context = this.spriteCanvas.nativeElement.getContext('2d');
    const image = context.createImageData(spriteWidth, spriteHeight);
    const data = image.data;
    // draw sprite
    x = 0;
    y = 0;

    for (const i in spriteIndexes) {
      if (y == this.spriteColorIndexes.height) {
        return;
      }

      if (spriteIndexes[i] === hoveredPaletteIndex) {
        hoverPixel(this.customPaletteColors, x, y, spriteIndexes[i], this.random_rgba());
      } else {
        drawPixel(this.customPaletteColors, x, y, spriteIndexes[i]);
      }

      x++;
      if (x == this.spriteColorIndexes.width) {
        x = 0;
        y++;
      }
    }
    swapBuffer();

    function drawPixel(palette, x, y, indexToPalette) {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      const index = 4 * (spriteWidth * roundedY + roundedX);
      data[index] = palette.rgba[indexToPalette].r;
      data[index + 1] = palette.rgba[indexToPalette].g;
      data[index + 2] = palette.rgba[indexToPalette].b;
      data[index + 3] = 255;
    }

    function hoverPixel(palette, x, y, indexToPalette, hoveredColor) {
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      const index = 4 * (spriteWidth * roundedY + roundedX);

      data[index] = hoveredColor.r;
      data[index + 1] = hoveredColor.g;
      data[index + 2] = hoveredColor.b;
      data[index + 3] = 255;
    }

    function swapBuffer() {
      context.putImageData(image, 0, 0);
    }

  }

  calculateClickedPaletteIndex(x, y) {
    let roundedUpX = Math.ceil(x / this.PALETTE_SCALE);
    let roundedDownY = Math.floor(y / this.PALETTE_SCALE);

    return this.ORIGINAL_PALETTE_WIDTH * roundedDownY + roundedUpX - 1;
  }

  rgbToHex(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  componentToHex(c) {
    const hex = c.toString();
    return hex.length == 1 ? "0" + hex : hex;
  }

  onInputPaletteColor(event) {
    const colorPickerRgba = this.hexToRgb(event.target.value);
    const selectedPaletteIndex = CanvasComponent.clickedPaletteIndex;
    this.customPaletteColors.rgba[selectedPaletteIndex].r = colorPickerRgba.r;
    this.customPaletteColors.rgba[selectedPaletteIndex].g = colorPickerRgba.g;
    this.customPaletteColors.rgba[selectedPaletteIndex].b = colorPickerRgba.b;
    this.drawSprite(this.spriteColorIndexes, this.customPaletteColors);
    const context = this.paletteCanvas.nativeElement.getContext('2d');
    context.fillStyle = 'rgb(' + colorPickerRgba.r + ',' + colorPickerRgba.g + ',' + colorPickerRgba.b + ')';
    const coordsByIndex = this.calculateCoordsByPaletteIndex(selectedPaletteIndex);
    context.fillRect(
      this.DELTA * coordsByIndex.x,
      this.DELTA * coordsByIndex.y,
      this.DELTA,
      this.DELTA
    );
    this.paletteCanvas.nativeElement.getContext('2d').context = context;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateCoordsByPaletteIndex(index) {
    return {
      x: index % this.ORIGINAL_PALETTE_WIDTH,
      y: Math.trunc(index / this.ORIGINAL_PALETTE_WIDTH)
    }
  }

}
