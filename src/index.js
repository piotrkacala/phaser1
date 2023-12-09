import Phaser from "phaser";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image(
      "tiles",
      "assets/tilemaps/IsometricAssetPack/256x192 Tiles.png"
    );
  }

  create() {
    const sizeFactor = 4;
    const mapSize = Math.pow(2, sizeFactor) + 1;
    const mapData = new Phaser.Tilemaps.MapData({
      width: mapSize,
      height: mapSize,
      tileWidth: 256,
      tileHeight: 192,
      orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
      format: Phaser.Tilemaps.Formats.ARRAY_2D,
    });

    const map = new Phaser.Tilemaps.Tilemap(this, mapData);

    const tileset = map.addTilesetImage("tiles", "tiles");

    const layer = map.createBlankLayer("layer", tileset, 0, 0);

    const heightMap = getNewHeighMap(mapSize);
    heightMap.forEach((item, index) => {
      const x = index % mapSize;
      const y = Math.floor(index / mapSize);

      let tileTexture;
      if (item < 10) {
        tileTexture = 1;
      } else if (item < 50) {
        tileTexture = 2;
      } else if (item < 75) {
        tileTexture = 3;
      } else if (item < 100) {
        tileTexture = 4;
      } else {
        tileTexture = 5;
      }
      layer.putTileAt(tileTexture, x, y);
    });

    const camera = this.cameras.main;
    let cameraDragStartX;
    let cameraDragStartY;

    this.input.on("pointerdown", () => {
      cameraDragStartX = camera.scrollX;
      cameraDragStartY = camera.scrollY;
    });

    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        camera.scrollX =
          cameraDragStartX + (pointer.downX - pointer.x) / camera.zoom;
        camera.scrollY =
          cameraDragStartY + (pointer.downY - pointer.y) / camera.zoom;
      }
    });

    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // Get the current world point under pointer.
      const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;
      camera.zoom = Phaser.Math.Clamp(newZoom, 0.25, 2);

      // Update camera matrix, so `getWorldPoint` returns zoom-adjusted coordinates.
      camera.preRender();
      const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      // Scroll the camera to keep the pointer under the same world point.
      camera.scrollX -= newWorldPoint.x - worldPoint.x;
      camera.scrollY -= newWorldPoint.y - worldPoint.y;
    });
  }
  update(time, delta) {}
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  zoom: 1,
  backgroundColor: "#2d2d2d",
  parent: "phaser-example",
  scene: MyGame,
  scale: {
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
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
