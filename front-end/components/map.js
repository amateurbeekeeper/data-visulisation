import React, { useState, useEffect } from "react";
import Map from "react-map-gl";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { scaleLinear } from 'd3-scale';
import "mapbox-gl/dist/mapbox-gl.css";

import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { DataFilterExtension, _TerrainExtension as TerrainExtension } from '@deck.gl/extensions';

import { LineLayer } from '@deck.gl/layers';

import {
    material,
    INITIAL_VIEW_STATE,
    colorRange,
    getTooltip
} from "./mapconfig.js";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';
const BUILDING_DATA = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d-tiles/buildings.geojson';

const COLORS = [
    [254, 235, 226],
    [251, 180, 185],
    [247, 104, 161],
    [197, 27, 138],
    [122, 1, 119]
];

const colorScale = scaleLinear().clamp(true).domain([0, 50, 100, 200, 300]).range(COLORS);

export default function MapComponent({
    showHexagonLayer = true,
    showLineLayer = false,
    show3DLayer = false,
    adjusted_values = false,
    upperPercentile = 100,
    coverage = 1,
    dataset = "edinburgh",
    distance = 0,
    opacity = 0.2,
    year,
}) {
    const [sampleData, setSampleData] = useState([]);
    const [pathsData, setPathsData] = useState([]);  // New state for paths data
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [credits, setCredits] = useState('');

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/nearest_paths?dataset=${dataset}&year=${year}`)
            .then((response) => response.json())
            .then((data) => {
                setPathsData(data);
            })
            .catch((error) => console.error('Error fetching paths data:', error));
    }, [dataset, year]);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/unique_coordinates?dataset=${dataset}&year=${year}`)
            .then((response) => response.json())
            .then((data) => {
                const processedData = data.map((item) => ({
                    coordinate: [item.longitude, item.latitude],
                    adjusted_counts: item.adjusted_counts,
                    location: item.location,
                }));

                // Calculate average latitude and longitude
                const averageLat = processedData.reduce((acc, item) => acc + item.coordinate[1], 0) / processedData.length;
                const averageLng = processedData.reduce((acc, item) => acc + item.coordinate[0], 0) / processedData.length;

                // Check if dataset is "all" and adjust zoom level accordingly
                let zoomLevel = dataset === "all" ? 8 : INITIAL_VIEW_STATE.zoom;

                setViewState({
                    ...INITIAL_VIEW_STATE,
                    latitude: averageLat,
                    longitude: averageLng,
                    zoom: zoomLevel
                });

                setSampleData(processedData);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, [dataset, year]);

    const lineData = pathsData.map(path => ({
        sourcePosition: [path.start[1], path.start[0]],
        targetPosition: [path.end[1], path.end[0]],
        color: [255, 0, 0]
    }));

    const getElevationValue = points => points[0].adjusted_counts;


    // Determine the min and max heights in your data
    const maxElevationValue = Math.max(...sampleData.map(d => d.adjusted_counts));
    const minElevationValue = 0;  // Assuming no negative heights

    const layers = [
        showHexagonLayer && new HexagonLayer({
            data: sampleData,
            getPosition: (d) => d.coordinate,
            getElevationValue,
            id: "heatmap",
            colorRange,
            colorDomain: [minElevationValue, maxElevationValue], // color based on height
            getColorValue: getElevationValue, // use height as the basis for color
            coverage,
            elevationRange: [0, 50],
            elevationScale: 10,
            extruded: true,
            pickable: true,
            radius: 100,
            upperPercentile,
            material,
        }),
        show3DLayer && new Tile3DLayer({
            id: 'google-3d-tiles',
            data: TILESET_URL,
            onTilesetLoad: tileset3d => {
                tileset3d.options.onTraversalComplete = selectedTiles => {
                    const uniqueCredits = new Set();
                    selectedTiles.forEach(tile => {
                        const { copyright } = tile.content.gltf.asset;
                        copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
                    });
                    setCredits([...uniqueCredits].join('; '));
                    return selectedTiles;
                };
            },
            loadOptions: {
                fetch: { headers: { 'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY } }
            },
            operation: 'terrain+draw'
        }),
        show3DLayer && new GeoJsonLayer({
            id: 'buildings',
            data: BUILDING_DATA,
            extensions: [new DataFilterExtension({ filterSize: 1 }), new TerrainExtension()],
            stroked: false,
            filled: true,
            getFillColor: ({ properties }) => colorScale(properties.distance_to_nearest_tree),
            opacity,
            getFilterValue: f => f.properties.distance_to_nearest_tree,
            filterRange: [distance, 500]
        }),
        showLineLayer && new LineLayer({
            id: 'line-layer',
            data: lineData,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.color,
            getWidth: 2
        }),
    ];

    return (
        <div style={{ height: '50vh', borderRadius: '0.5rem' }}>
            <DeckGL
                layers={layers}
                initialViewState={viewState}
                controller={true}
                className="rounded-md"
                getTooltip={getTooltip}
            >
                <Map
                    className="rounded-md"
                    controller={true}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    mapStyle="mapbox://styles/jamesrowles/clmbti7w2018b01nz7q0r5bqy"
                ></Map>
            </DeckGL>
        </div>
    );
}
