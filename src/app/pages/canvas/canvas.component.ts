import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Rgba} from "../../models/rgba";
import {SpriteColorIndexes} from "../../models/sprite-color-indexes";
import {PaletteColors} from "../../models/palette-colors";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, AfterViewInit {

  // static variables
  paletteScale = 9; // increase this to change size of the palette
  originalPaletteWidth = 8;
  originalPaletteHeight = 32;
  paletteWidth = this.originalPaletteWidth * this.paletteScale;
  paletteHeight = this.originalPaletteHeight * this.paletteScale;
  delta = this.paletteWidth / this.originalPaletteWidth;
  @Input()
  spriteColorIndexes: SpriteColorIndexes;

  @Input()
  defaultPaletteColors: PaletteColors;


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

  convertRgbaToCss(index, rgba: Rgba[]) {
    const paletteRgba = rgba[index];
    return 'rgba(' + paletteRgba.r + ', ' + paletteRgba.g + ', ' + paletteRgba.b + ', 1.0)';
  }

  public drawSprite(spriteColorIndexes: SpriteColorIndexes) {
    var startTime = performance.now();
    const imgWidth = spriteColorIndexes.width;
    const imgHeight = spriteColorIndexes.height;
    this.spriteCanvas.nativeElement.width = imgWidth;
    this.spriteCanvas.nativeElement.height = imgHeight;

    var context = this.spriteCanvas.nativeElement.getContext('2d');

    var image = context.createImageData(imgWidth, imgHeight);
    var data = image.data;

    // draw sprite
    var x = 0;
    var y = 0;
    spriteColorIndexes.spriteColorIndexes.forEach(indexToPalette => {
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

    //console.log(`Drawing took ${endTime - startTime} milliseconds`);

    function drawPixel(palette, x, y, indexToPalette) {
      var roundedX = Math.round(x);
      var roundedY = Math.round(y);

      var index = 4 * (imgWidth * roundedY + roundedX);

      data[index] = palette.rgba[indexToPalette].r;
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
    CanvasComponent.clickedPaletteIndex = this.calculateClickedPaletteIndex(x, y);
    console.log(CanvasComponent.clickedPaletteIndex);
    this.colorPicker.nativeElement.value = this.rgbToHex(r, g, b);
    this.colorPicker.nativeElement.click();
  }

  invertHex(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xFFFFFF ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color; // prepend #
    return color;
  }

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return {
      r: o(r()*s),
      g: o(r()*s),
      b: o(r()*s),
      a: r().toFixed(1)
    }
  }

  hoverPaletteAndGetCurrentIndex(event) {
    console.log("1")
    if (this.spriteColorIndexes === undefined || this.spriteColorIndexes === null) {
      return;
    }
    let spriteIndexes = this.spriteColorIndexes.spriteColorIndexes;
    // get hovered index
    var elemLeft = this.paletteCanvas.nativeElement.offsetLeft + this.paletteCanvas.nativeElement.clientLeft;
    var elemTop = this.paletteCanvas.nativeElement.offsetTop + this.paletteCanvas.nativeElement.clientTop;
    var x = event.pageX - elemLeft;
    var y = event.pageY - elemTop;


    var hoveredPaletteIndex = this.calculateClickedPaletteIndex(x, y);

    /// hover

    // prepare canvas
    let spriteWidth = this.spriteColorIndexes.width;
    let spriteHeight = this.spriteColorIndexes.height
    var context = this.spriteCanvas.nativeElement.getContext('2d');
    var image = context.createImageData(spriteWidth, spriteHeight);
    var data = image.data;

    // draw sprite
    var x = 0;
    var y = 0;

    for (const i in spriteIndexes) {
      if (y == this.spriteColorIndexes.height) {
        return;
      }

      if (spriteIndexes[i] === hoveredPaletteIndex) {
        let hexColor = this.rgbToHex(
          this.defaultPaletteColors.rgba[spriteIndexes[i]].r,
          this.defaultPaletteColors.rgba[spriteIndexes[i]].g,
          this.defaultPaletteColors.rgba[spriteIndexes[i]].b)
        let invertedHexColor = this.invertHex(hexColor);
        let invertedRgbaColor = this.hexToRgb(invertedHexColor);
        hoverPixel(this.defaultPaletteColors, x, y, spriteIndexes[i], this.random_rgba());
      } else {
        drawPixel(this.defaultPaletteColors, x, y, spriteIndexes[i]);
      }

      x++;
      if (x == this.spriteColorIndexes.width) {
        x = 0;
        y++;
      }
    }
    swapBuffer();
    function drawPixel(palette, x, y, indexToPalette) {
      var roundedX = Math.round(x);
      var roundedY = Math.round(y);

      var index = 4 * (spriteWidth * roundedY + roundedX);

      data[index] = palette.rgba[indexToPalette].r;
      data[index + 1] = palette.rgba[indexToPalette].g;
      data[index + 2] = palette.rgba[indexToPalette].b;
      data[index + 3] = 255;
    }

    function hoverPixel(palette, x, y, indexToPalette, hoveredColor) {
      var roundedX = Math.round(x);
      var roundedY = Math.round(y);

      var index = 4 * (spriteWidth * roundedY + roundedX);

      data[index] = hoveredColor.r;
      data[index + 1] = hoveredColor.g;
      data[index + 2] = hoveredColor.b;
      data[index + 3] = 255;
    }

    function swapBuffer() {
      context.putImageData(image, 0, 0);
    }

  }

  getElementPosition(element) {
    var rect = element.getBoundingClientRect();
    return {x: rect.left, y: rect.top};
  }


  calculateClickedPaletteIndex(x, y) {
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
    const colorPickerRgba = this.hexToRgb(event.target.value);
    const selectedPaletteIndex = CanvasComponent.clickedPaletteIndex;
    console.log("XXXXXXXXXXXX")
    console.log(this.defaultPaletteColors)
    console.log("YYYY" + selectedPaletteIndex)
    this.defaultPaletteColors.rgba[selectedPaletteIndex].r = colorPickerRgba.r;
    this.defaultPaletteColors.rgba[selectedPaletteIndex].g = colorPickerRgba.g;
    this.defaultPaletteColors.rgba[selectedPaletteIndex].b = colorPickerRgba.b;
    this.drawSprite(this.spriteColorIndexes);

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

}
