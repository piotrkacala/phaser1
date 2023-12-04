import Phaser from "phaser";
import logoImg from "./assets/logo.png";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image("tiles", "assets/tilemaps/iso/iso-64x64-outside.png");
  }

  create() {
    const sizeFactor = 4;
    const mapSize = Math.pow(2, sizeFactor) + 1;
    const mapData = new Phaser.Tilemaps.MapData({
      width: mapSize,
      height: mapSize,
      tileWidth: 64,
      tileHeight: 32,
      orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
      format: Phaser.Tilemaps.Formats.ARRAY_2D,
    });

    const map = new Phaser.Tilemaps.Tilemap(this, mapData);

    const tileset = map.addTilesetImage("iso-64x64-outside", "tiles");

    const layer = map.createBlankLayer("layer", tileset, 350, 200);

    // const data = [
    //   [11, 11, 12, 13, 14, 15, 16, 10, 11, 12],
    //   [13, 11, 10, 12, 12, 15, 16, 10, 16, 10],
    //   [12, 10, 16, 13, 14, 15, 16, 16, 13, 12],
    //   [10, 11, 12, 13, 14, 15, 16, 10, 11, 12],
    //   [13, 11, 10, 12, 12, 15, 16, 10, 16, 10],
    //   [12, 10, 16, 13, 14, 15, 16, 16, 13, 12],
    //   [10, 11, 12, 13, 14, 15, 16, 10, 11, 12],
    //   [13, 11, 10, 12, 12, 15, 16, 10, 16, 10],
    //   [12, 10, 16, 13, 14, 15, 16, 16, 13, 12],
    //   [10, 11, 12, 13, 14, 15, 16, 10, 11, 12],
    // ];

    // let y = 0;

    // data.forEach((row) => {
    //   row.forEach((tile, x) => {
    //     layer.putTileAt(tile, x, y);
    //   });

    //   y++;
    // });
    const heightMap = getNewHeighMap(mapSize);
    heightMap.forEach((item, index) => {
      const x = index % mapSize;
      const y = Math.floor(index / mapSize);

      let tileTexture;
      if (item < 10) {
        tileTexture = 175;
      } else if (item < 50) {
        tileTexture = 11;
      } else if (item < 75) {
        tileTexture = 78;
      } else if (item < 100) {
        tileTexture = 105;
      } else {
        tileTexture = 105;
      }
      layer.putTileAt(tileTexture, x, y);
    });
    console.log(heightMap);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#2d2d2d",
  parent: "phaser-example",
  pixelArt: true,
  scene: MyGame,
};

const game = new Phaser.Game(config);

const getNewHeighMap = (mapWidth) => {
  const minHeight = 1;
  const maxHeight = 100;
  const map = new Float32Array(mapWidth * mapWidth);
  const rowMax = mapWidth - 1;

  const setItem = (x, y, val) => {
    map[x + y * mapWidth] = val;
  };

  const getItem = (x, y) => {
    if (x < 0 || x > rowMax || y < 0 || y > rowMax) return -1;
    return map[x + mapWidth * y];
  };

  const calcSquare = (x, y, stepSize) => {
    const stepHalf = stepSize / 2;

    const a = getItem(x - stepHalf, y - stepHalf);
    const b = getItem(x + stepHalf, y - stepHalf);
    const c = getItem(x - stepHalf, y + stepHalf);
    const d = getItem(x + stepHalf, y + stepHalf);
    const avg = (a + b + c + d) / 4;
    const scale = (stepHalf / mapWidth) * maxHeight;
    const randomOffset = Math.random() * scale * 2 - scale;
    setItem(x, y, Math.round(avg + randomOffset));
  };

  const calcDiamond = (x, y, stepSize) => {
    const stepHalf = stepSize / 2;

    const a = getItem(x, y - stepHalf);
    const b = getItem(x - stepHalf, y);
    const c = getItem(x + stepHalf, y);
    const d = getItem(x, y + stepHalf);

    const avg = (a + b + c + d) / 4;
    const scale = (stepHalf / mapWidth) * maxHeight;
    const randomOffset = Math.random() * scale * 2 - scale;
    setItem(x, y, Math.round(avg + randomOffset));
  };

  setItem(0, 0, minHeight);
  setItem(rowMax, 0, Math.round(Math.random() * maxHeight));
  setItem(0, rowMax, Math.round(Math.random() * maxHeight));
  setItem(rowMax, rowMax, maxHeight);

  const iterateStep = (stepSize) => {
    const stepHalf = stepSize / 2;

    for (let y = stepHalf; y < mapWidth; y = y + stepSize) {
      for (let x = stepHalf; x < mapWidth; x = x + stepSize) {
        calcSquare(x, y, stepSize);
      }
    }

    for (let y = 0; y < mapWidth; y = y + stepSize) {
      for (let x = 0; x < mapWidth; x = x + stepSize) {
        calcDiamond(x + stepHalf, y, stepSize);
        calcDiamond(x, y + stepHalf, stepSize);
      }
    }
  };
  let sampleSize = rowMax;
  while (sampleSize > 1) {
    iterateStep(sampleSize);
    sampleSize = sampleSize / 2;
  }
  return map;
};
