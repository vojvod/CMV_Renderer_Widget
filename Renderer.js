define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dojo/dom-construct',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/_base/array',
		
	'dijit/form/FilteringSelect',
	'dojo/store/Memory',
	
	'esri/symbols/SimpleLineSymbol',
	'esri/symbols/SimpleFillSymbol',
	'esri/tasks/ClassBreaksDefinition',
	'esri/tasks/UniqueValueDefinition',
	'esri/tasks/AlgorithmicColorRamp',
	'esri/tasks/GenerateRendererParameters',
	'esri/tasks/GenerateRendererTask',
	'esri/Color',
	
	'dijit/form/Button',
	
	'dojo/text!./Renderer/templates/Renderer.html',
	'dojo/i18n!./Renderer/nls/resource',
	'xstyle/css!./Renderer/css/Renderer.css',
		
	
	
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, lang, aspect, array,
			 FilteringSelect, Memory,
			 SimpleLineSymbol, SimpleFillSymbol, ClassBreaksDefinition, UniqueValueDefinition, AlgorithmicColorRamp, GenerateRendererParameters, 
			 GenerateRendererTask, Color, Button, Renderer, i18n) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		widgetsInTemplate: true,
		templateString: Renderer,
		baseClass: 'gis_RendererDijit',
		i18n: i18n,	
		layerSeparator: '||',
		init_renderers: [],
		
		postCreate: function () {
		
			this.inherited(arguments);				
						
			this.layers = [];			
            array.forEach(this.layerInfos, function (layerInfo) {
                var lyrId = layerInfo.layer.id;
                var layer = this.map.getLayer(lyrId);
                if (layer) {
                    var url = layer.url;
                    // handle feature layers
                    if (layer.declaredClass === 'esri.layers.FeatureLayer') {
                        // If is a feature layer that does not support
                        // Identify (Feature Service), create an
                        // infoTemplate for the graphic features. Create
                        // it only if one does not already exist.
                        if (layer.capabilities && layer.capabilities.toLowerCase().indexOf('data') < 0) {
                            if (!layer.infoTemplate) {
                                var infoTemplate = this.getInfoTemplate(layer, layer.layerId);
                                if (infoTemplate) {
                                    layer.setInfoTemplate(infoTemplate);
                                    return;
                                }
                            }
                        }
                        // If it is a feature Layer, we get the base url
                        // for the map service by removing the layerId.
                        var lastSL = url.lastIndexOf('/' + layer.layerId);
                        if (lastSL > 0) {
                            url = url.substring(0, lastSL);
                        }
                    }
                    this.layers.push({
                        ref: layer,
                        layerInfo: layerInfo
                    });	
                    // rebuild the layer selection list when any layer is hidden
                    // but only if we have a UI
                    if (this.parentWidget) {
                        layer.on('visibility-change', lang.hitch(this, function (evt) {
                            if (evt.visible === false) {
                                this.loadEpipedoOptions();
                            }
                        }));
                    }
                }
            }, this);
			
			this.init_renderers.push({
				layerid: 'simos',
				init_render: 'null'
			});
			
			this.initRendererButton.on('click', lang.hitch(this, 'initRenderer'));
			this.setRendererButton.on('click', lang.hitch(this, 'createRenderer'));
			
			// rebuild the layer selection list when the map is updated
            // but only if we have a UI
            if (this.parentWidget) {
                this.loadEpipedoOptions();
                this.map.on('update-end', lang.hitch(this, function () {
                    this.loadEpipedoOptions();
                }));
            }
						
			if (this.parentWidget) {
				if (this.parentWidget.toggleable) {
					this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
						this.onLayoutChange(this.parentWidget.open);
					})));
				}
				this.own(aspect.after(this.parentWidget, 'resize', lang.hitch(this, function () {
					this.gis_RendererDijitContainerNode.resize();
				})));
			}
			
		},
		 
		onLayoutChange: function (open) {
			if (open) {
				this.gis_RendererDijitContainerNode.resize();
			} 
		},
		
		loadEpipedoOptions: function(){
			var id = null;
            var renderingItems = [];
            var selectedId = this.querySelectEpipedo.get('value');
            var sep = this.layerSeparator;
			
			array.forEach(this.layers, lang.hitch(this, function (layer) {
                var ref = layer.ref,
                selectedIds = layer.layerInfo.layerIds;								
                // only include layers that are currently visible
                if (ref.visible) {
                    var name = this.getLayerName(layer);
                    if ((ref.declaredClass === 'esri.layers.FeatureLayer') && !isNaN(ref.layerId)) { // feature layer
                        renderingItems.push({
                            name: name,
                            id: ref.id + sep + ref.layerId,
							layer: layer
                        });
                        // previously selected layer is still visible so keep it selected
                        if (ref.id + sep + ref.layerId === selectedId) {
                            id = selectedId;
                        }
                    } 
                }
            }));
			
			renderingItems.sort(function (a, b) {
                return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
            });
						
			this.querySelectEpipedo.set('disabled', (renderingItems.length < 1));
            if (renderingItems.length > 0) {
                renderingItems.unshift({
                    name: this.i18n.selectQueryLayer,
                    id: '***'
                });
                if (!id) {
                    id = renderingItems[0].id;
                }
            }
            var layer4rendering = new Memory({
                data: renderingItems
            });
						
            this.querySelectEpipedo.set('store', layer4rendering);
            this.querySelectEpipedo.set('value', id);
		},
								
		getLayerName: function (layer) {
            var name = null;
            if (layer.layerInfo) {
                name = layer.layerInfo.title;
            }
            if (!name) {
                array.forEach(this.layers, function (lyr) {
                    if (lyr.ref.id === layer.id) {
                        name = lyr.layerInfo.title;
                        return;
                    }
                });
            }
            if (!name) {
                name = layer.name;
                if (!name && layer.ref) {
                    name = layer.ref._titleForLegend; // fall back to old method using title from legend
                }
            }
            return name;
        },		
		
		_onQuerySelectEpipedoChange: function () {
			var id = null;
			var renderedFields = [];
									
			if(this.querySelectEpipedo.item.layer){
				array.forEach(this.querySelectEpipedo.item.layer.ref.fields, function (field) {					
					renderedFields.push({
						name: field.alias,
                        id: field.name,
						type: field.type
                    });
				});
			}
			
			this.querySelectField.set('disabled', (renderedFields.length < 1));
									
			var fields4rendering = new Memory({
                data: renderedFields
            });
									
            this.querySelectField.set('store', fields4rendering);
            this.querySelectField.set('value', id);
			
			this.querySelectMethod.set('disabled',true);
			this.querySelectNumberOfClasses.set('disabled',true);
			
		},
		
		_onQuerySelectMethodChange: function(){
			this.createRenderer();
		},
		
		createRenderer: function(){
			var app = this;
			var classDef;
			
			app.sfs = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(
              SimpleLineSymbol.STYLE_SOLID,
              new Color([0, 0, 0]), 
              0.5 
            ),
            null
          );
		  
		  if(this.querySelectField.item.type == 'esriFieldTypeString'){
			classDef = new UniqueValueDefinition();
			classDef.attributeField = this.querySelectField.value;
			this.querySelectMethod.set('disabled',true);
			this.querySelectNumberOfClasses.set('disabled',true);
		  }else{
			this.querySelectMethod.set('disabled',false);
			this.querySelectNumberOfClasses.set('disabled',false);
			classDef = new ClassBreaksDefinition();
			classDef.classificationField = this.querySelectField.value;
			classDef.classificationMethod = this.querySelectMethod.value;
			classDef.breakCount = this.querySelectNumberOfClasses.value;
			classDef.baseSymbol = app.sfs;  
		  }

          var colorRamp = new AlgorithmicColorRamp();
          colorRamp.fromColor = Color.fromHex("#998ec3");
          colorRamp.toColor = Color.fromHex("#f1a340");
          colorRamp.algorithm = "hsv"; // options are:  "cie-lab", "hsv", "lab-lch"
          classDef.colorRamp = colorRamp;

          var params = new GenerateRendererParameters();
          params.classificationDefinition = classDef;
          // limit the renderer to data being shown by the feature layer
          //params.where = app.layerDef; 
		  if(this.querySelectEpipedo.item.layer && this.querySelectField.item.type != 'esriFieldTypeGeometry' ){
			var generateRenderer = new GenerateRendererTask(this.querySelectEpipedo.item.layer.ref.url);
			generateRenderer.execute(params, lang.hitch(this, 'applyRenderer'), lang.hitch(this, 'errorHandler'));			
		  }          
		},
		
		applyRenderer: function(renderer) {			
			var layerid = this.querySelectEpipedo.item.layer.ref.id;			
			var addRender = true;
			array.forEach(this.init_renderers, function (item) {
				if(layerid == item.layerid)
					addRender = false
			});			
			if(addRender){
				this.init_renderers.push({
					layerid: layerid,
					init_render: this.querySelectEpipedo.item.layer.ref._getRenderer()
				});	
			}			
			this.map.getLayer(layerid).setRenderer(renderer);
			this.map.getLayer(layerid).redraw();
			this.map.getLayer(layerid).refresh(); 
			dijit.byId("legend_widget").refresh();
        },
		
		errorHandler: function(err) {
			console.log('Oops, error: ', err);
        },
		
		initRenderer: function() {
			var layerid = this.querySelectEpipedo.item.layer.ref.id;
			var map = this.map;
			array.forEach(this.init_renderers, function (item) {
				if(layerid == item.layerid){
					map.getLayer(layerid).setRenderer(item.init_render);
					map.getLayer(layerid).redraw();
					map.getLayer(layerid).refresh();	
				}
			});
			dijit.byId("legend_widget").refresh();
		}
		
	});
	
});