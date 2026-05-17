# leaf-map-window

Interaktivní webová aplikace pro vizualizaci prostorových dat s využitím knihovny Leaflet, jeho rozšířeních a 3D mapových technologií.

Live aplikace: https://leaf-map-window.onrender.com/

## Instalace

### Přes Git

```bash
git clone https://github.com/LukasVlasak/leaf-map-window.git
cd leaf-map-window
npm install
npm run build
```

Hotový build se nachází ve složce `dist/`.

### Alternativně přes npm pack

Po buildu lze vytvořit přenositelný balíček `.tgz`:

```bash
npm pack
```

Vzniklý soubor `leaf-map-window-1.0.0.tgz` lze nainstalovat do jiného projektu:

```bash
npm install /cesta/k/leaf-map-window-1.0.0.tgz
```

Knihovna vyžaduje Leaflet jako peer dependency — pokud ho projekt neobsahuje:

```bash
npm install leaflet
```

## Použití
Je nutné mít vytvořeny <div> element s ID, které je nutné předat do MapWindow kontruktoru. V případě ID="map" není nutné nic předávat, neboť "map" je defaultní hodnota pro HTML element mapy.

### S bundlerem (webpack, vite, ...)

```ts
import "leaflet/dist/leaflet.css";
import "leaf-map-window/dist/leaf-map-window.css";
import MapWindow from "leaf-map-window";

const map = new MapWindow();
map.init();
```

### Bez bundleru (UMD / script tag)

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="./node_modules/leaf-map-window/dist/leaf-map-window.css">

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="./node_modules/leaf-map-window/dist/leaf-map-window.js"></script>

<script>
  const map = new LeafMapWindow();
  map.init();
</script>
```

Soubory je nutné servovat přes HTTP server (např. `npx serve .`) — viz [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).

## Vývoj

```bash

# Git Clone
git clone https://github.com/LukasVlasak/leaf-map-window

# Instalace závislostí
npm install

# Spuštění dema s hot reloadingem
npm run demo

# Build knihovny
npm run build

# Typová kontrola
npm run type-check
```
