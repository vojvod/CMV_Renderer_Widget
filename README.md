# Dynamic Feature Layer Renderer Widget
A widget for CMV (http://cmv.io/). It renders a feature layer dynamically. <b>It can be used for map services hosted in ArcGIS for Server version 10.1 and above.</b>

![alt tag](https://github.com/vojvod/CMV_Renderer_Widget/blob/master/img1.jpg)

![alt tag](https://github.com/vojvod/CMV_Renderer_Widget/blob/master/img2.jpg)

## Widget Configuration
Add the widget configuration object to the widgets object in viewer.js.
```javascript
widgets: {
    ...
    renderer: {
        include: true,
        id: 'renderer',
        type: 'titlePane',
        canFloat: false,
        path: 'gis/dijit/Renderer',
        title: 'Dynamic Feature Layer Renderer',
        open: false,
        position: 10,
        options: 'config/renderer'
    },
    ...
}
```
Copy Renderer folder and Renderer.js to folder gis/dijit/ at your CMV installation.

Copy renderer.js to folder confing at your CMV installation.

Modify renderer.js file.
```javascript
define({
    map: true,
    identifyLayerInfos: true,
    proxy_url: 'http://localhost:81/cmv/proxy/PHP/proxy.php',
    layers2render: [
        {
            id: 'Cities',
            url: 'http://sampleserver5.arcgisonline.com/arcgis/rest/services/WorldTimeZones/MapServer/0',
            fields: ['POP_CLASS','CITY_NAME','POP_RANK' ]
        },{
            id: 'Continent',
            url: 'http://sampleserver5.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer/1',
            fields: ['CONTINENT']
        }
    ]
});
```

