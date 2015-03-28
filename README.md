# AddWMSLayer Widget
A widget for CMV (http://cmv.io/). It adds wms layers from combobox or from textbox.

![alt tag](https://github.com/vojvod/CMV_addWMSLayer_Widget/blob/master/cmv_addwmslayer_widget.png)

## Widget Configuration
Add the widget configuration object to the widgets object in viewer.js.
```javascript
widgets: {
    ...
    wmslayer: {
  	    include: true,
  		id: 'wmslayer',
  		type: 'titlePane',
  		canFloat: true,
  		position: 17,
  		path: 'gis/dijit/WMSLayer',
  		placeAt: 'left',
  		title: 'Add WMS Layer',
  		options: {
  		    map: true
  		  }
  	},
  	wmslayer2: {
        include: true,
      	id: 'wmslayer',
      	type: 'titlePane',
      	canFloat: true,
      	position: 18,
      	path: 'gis/dijit/WMSLayer2',
      	placeAt: 'left',
      	title: 'Add WMS Layer',
      	options: {
      	    map: true
      	}
    },
    ...
}
```
Copy WMSLayer, WMSLayer2, WMSLayer.js and WMSLayer2.js to folder gis/dijit/ at your CMV installation.

Configure your proxy.
