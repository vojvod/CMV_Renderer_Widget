# Dynamic Feature Layer Renderer Widget
A widget for CMV (http://cmv.io/). It renders a feature layer dynamically.

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