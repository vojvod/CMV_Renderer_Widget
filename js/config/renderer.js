define({
    map: true,
    identifyLayerInfos: true,

    layers2render: [{
        id: 'test',
        url: 'http://91.121.153.133/arcgis/rest/services/General/overview_map_greece/MapServer/0',
        fields: ['PERIF_DESC', 'Shape_Length']
    }
    ]

});