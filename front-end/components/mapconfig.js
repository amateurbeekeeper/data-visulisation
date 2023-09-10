import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";

export const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

export const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

export const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

export const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

export const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
};

export const INITIAL_VIEW_STATE = {
  longitude: -3.188267, // Edinburgh
  latitude: 55.953252, // Edinburgh
  zoom: 10,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

export const colorRange = [
  [173, 216, 230],  // LightBlue
  [100, 149, 237],  // CornflowerBlue
  [70, 130, 180],   // SteelBlue
  [106, 90, 205],   // SlateBlue
  [123, 104, 238],  // MediumSlateBlue
  [138, 43, 226],   // BlueViolet
];

export function getTooltip({ object }) {
  if (!object) {
    return null;
  }

  const lat = object.position[1];
  const lng = object.position[0];
  const firstPoint = object.points[0];

  return `latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    count: ${object.points.length}
    location: ${firstPoint.source.location}
    adjusted_counts: ${firstPoint.source.adjusted_counts}
  `;
}