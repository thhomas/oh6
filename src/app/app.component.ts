import { Component } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import { transform } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import TileImage from 'ol/source/TileImage';
import { Feature, Geolocation, ImageTile } from 'ol';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Layer from 'ol/layer/Layer';
import Source from 'ol/source/Source';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'oh6';
  tracking = true;
  layerPreviewUrl = [
    "https://dtsi-sgt.maps.arcgis.com/sharing/rest/content/items/da224a6ff1c24c029de4024d7ae8af26/resources/inConfig/2541222967421666.png",
    "https://dtsi-sgt.maps.arcgis.com/sharing/rest/content/items/da224a6ff1c24c029de4024d7ae8af26/resources/inConfig/5045809582584766.png"
  ];
  baseLayers : Layer<Source>[] = [];
  baseLayerDisplayed = 0;

  ngOnInit(): void {  

    const view = new View({
      // Defining the location in Lat Lon.
      center:  transform([165.6,-21.5], 'EPSG:4326', 'EPSG:3857'),
      zoom: 8
    });


    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });



    const positionFeature = new Feature();
    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    );
    
    geolocation.setTracking(this.tracking);

    this.baseLayers = [
      new TileLayer({
        // title: "Fond d'images du GéoRépertoire",
        // baseLayer: true,
        // preview: "https://dtsi-sgt.maps.arcgis.com/sharing/rest/content/items/da224a6ff1c24c029de4024d7ae8af26/resources/inConfig/7477904628162948.png",
        source: new TileArcGISRest({
          url: "https://carto.gouv.nc/public/rest/services/fond_imagerie/MapServer",
          attributions: "Gouvernement de la Nouvelle-Calédonie et GIE SERAIL"
        }),
        visible: false
      }),
      new TileLayer({
        // title: "Fond d'images du GéoRépertoire",
        // baseLayer: true,
        // preview: "https://dtsi-sgt.maps.arcgis.com/sharing/rest/content/items/da224a6ff1c24c029de4024d7ae8af26/resources/inConfig/7477904628162948.png",
        source: new TileArcGISRest({
          url: "https://carto.gouv.nc/public/rest/services/fond_cartographie/MapServer",
          attributions: "Gouvernement de la Nouvelle-Calédonie et GIE SERAIL",
        }),
        visible: false
      })
    ];
    this.baseLayers[this.baseLayerDisplayed].setVisible(true);

    const map = new Map({
      layers: this.baseLayers.concat(new VectorLayer({
        source: new VectorSource({
          features: [positionFeature],
        })
      })),
      target: 'map',
      view: view
    });
    geolocation.on('change:position', () => {
      const coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
      view.setCenter(coordinates);
      view.setZoom(13);
    });
  }

  switchBaseLayer() {
    this.baseLayers[this.baseLayerDisplayed].setVisible(false);
    this.baseLayerDisplayed += 1;
    if(this.baseLayerDisplayed == this.baseLayers.length) {
      this.baseLayerDisplayed = 0;
    }
    this.baseLayers[this.baseLayerDisplayed].setVisible(true);
  }
}
