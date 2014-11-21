    "use strict";

    /**
     * A {@link Visualizer} which maps {@link Entity#Proxy} to a {@link Polyline}.
     * @alias ProxyVisualizer
     * @constructor
     *
     * @param {Scene} scene The scene the primitives will be rendered in.
     * @param {EntityCollection} entityCollection The entityCollection to visualize.
     */
    var ProxyVisualizer = function(scene, entityCollection) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(scene)) {
            throw new Cesium.DeveloperError('scene is required.');
        }
        if (!Cesium.defined(entityCollection)) {
            throw new Cesium.DeveloperError('entityCollection is required.');
        }
        //>>includeEnd('debug');

        entityCollection.collectionChanged.addEventListener(ProxyVisualizer.prototype._onCollectionChanged, this);

        this._scene = scene;
        this._entityCollection = entityCollection;        
        this._primitives = scene.primitives;
        this._entitiesToVisualize = new Cesium.AssociativeArray();
        
        this._hash = {};
        
        this._onCollectionChanged(entityCollection, entityCollection.entities, [], []);
    };
    
    var cachedPosition = new Cesium.Cartesian3();    
    var proxy_billboards;
    
    /**
     * Updates all of the primitives created by this visualizer to match their
     * Entity counterpart at the given time.
     *
     * @param {JulianDate} time The time to update to.
     * @returns {Boolean} This function always returns true.
     */
    ProxyVisualizer.prototype.update = function(time) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(time)) {
            throw new DeveloperError('time is required.');
        }
        //>>includeEnd('debug');

        var entities = this._entitiesToVisualize.values;
        var hash = this._hash;
        var primitives = this._primitives;

        for (var i = 0, len = entities.length; i < len; i++) {
            var entity = entities[i];
            var proxyGraphics = entity.proxy;

            var position = cachedPosition;
            var rotation = 0;
            var scale = 1.0;
            var color;
            var data = hash[entity.id];
            var show = entity.isAvailable(time) && Cesium.Property.getValueOrDefault(proxyGraphics._show, time, true);

            if (show) {
                position = Cesium.Property.getValueOrUndefined(entity._position, time, cachedPosition);
                rotation = Cesium.Property.getValueOrDefault(proxyGraphics.rotation, time, 0.0);
                scale = Cesium.Property.getValueOrDefault(proxyGraphics.scale, time, 1.0);
                color = Cesium.Property.getValueOrDefault(proxyGraphics.color, time, Cesium.Color.WHITE);
            }

            if (!show) {
                //don't bother creating or updating anything else
                if (Cesium.defined(data)) {
                    data.primitive.show = false;
                }
                continue;
            }

            var primitive = Cesium.defined(data) ? data.primitive : undefined;
            if (!Cesium.defined(primitive)) {
            
                var objlen = proxyGraphics.objects.length;
                var objects = [];
                for (var j=0; j<objlen; j++)
                {
                    var obj = proxyGraphics.objects[j];
                    var subobj = undefined;
                    
                    if (obj.type == "model")
                    {
                        var myPosition = Cesium.Cartesian3.fromDegrees(-9.1394 , 38.7138, 0.0);
                        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(myPosition);                    
                        //var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                        
                        var myModel = Cesium.Model.fromGltf({
                        show : true,
                        url : obj.uri,	
                        modelMatrix : modelMatrix,
                        minimumPixelSize: obj.minimumPixelSize,
                        scale : obj.scale,
                        id: entity
                        });       
                        subobj = myModel;
                    }
                    else
                    if (obj.type == "billboard")
                    {
                        if (!Cesium.defined(proxy_billboards))
                            proxy_billboards = this._scene.primitives.add(new Cesium.BillboardCollection());                        
                        
                        var myBillboard = proxy_billboards.add({        
                        show : true,
                        position : position,
                        rotation:  rotation,
                        color:  color,
                        scale: scale,
                        image : obj.image,
                        //scale : Cesium.defaultValue(obj.scale, 1.0),                        
                        id: entity
                        });
                      
                        subobj = myBillboard;
                    }
                    
                    if (Cesium.defined(subobj))
                    {
                        objects.push({object: subobj, distance: obj.distance});
                    }
                }
                
            
                if (Cesium.defined(position)) {
                    primitive = new ProxyPrimitive(position, rotation, scale, objects, this._primitives);
                    primitive.id = entity;
                    primitives.add(primitive);

                    data = {
                        primitive : primitive,
                        color: undefined,
                        position : undefined,
                        rotation: undefined,
                        scale: undefined
                    };
                    hash[entity.id] = data;
                }
                else {
                    continue;
                }
            }
                       
            if (!Cesium.Cartesian3.equals(position, data.position)) {
                data.position = Cesium.Cartesian3.clone(position, data.position);
                primitive.position = data.position;
            }

            if (rotation!=data.rotation) {
                data.rotation = rotation;
                primitive.rotation = data.rotation;
            }

            if (scale!=data.scale) {
                data.scale = scale;
                primitive.scale = data.scale;
            }
            
            if (color!=data.color) {
                data.color = color;
                primitive.color = data.color;
            }

            primitive.show = true;
        }
        
        return true;
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     *
     * @returns {Boolean} True if this object was destroyed; otherwise, false.
     */
    ProxyVisualizer.prototype.isDestroyed = function() {
        return false;
    };

    function removePrimitive(entity, hash, primitives) {
        var data = hash[entity.id];
        if (Cesium.defined(data)) {
            var primitive = data.primitive;
            primitives.remove(primitive);
            if (!primitive.isDestroyed()) {
                primitive.destroy();
            }
            delete hash[entity.id];
        }
    }    
    /**
     * Removes and destroys all primitives created by this instance.
     */
    ProxyVisualizer.prototype.destroy = function() {
        var entityCollection = this._entityCollection;
        entityCollection.collectionChanged.removeEventListener(ProxyVisualizer.prototype._onCollectionChanged, this);

        var updaters = this._updaters;
        for ( var key in updaters) {
            if (updaters.hasOwnProperty(key)) {
                updaters[key].destroy();
            }
        }

        var hash = this._hash;
        var entities = entityCollection.entities;
        var length = entities.length;
        var primitives = this._primitives;
        for (var i = 0; i < length; i++) {
            removePrimitive(entities[i], hash, primitives);
            entities[i]._proxyUpdater = undefined;
            entities[i]._proxyVisualizerIndex = undefined;
        }
        
        return Cesium.destroyObject(this);
    };

    ProxyVisualizer.prototype._onCollectionChanged = function(entityCollection, added, removed, changed) {
        var i;
        var entity;
        var _proxyUpdater;
        var entities = this._entitiesToVisualize;

        for (i = added.length - 1; i > -1; i--) {
            entity = added[i];
            if (Cesium.defined(entity.proxy) && Cesium.defined(entity._position)) {
                entities.set(entity.id, entity);
            }
        }

        for (i = changed.length - 1; i > -1; i--) {
            entity = changed[i];
            if (Cesium.defined(entity.proxy) && Cesium.defined(entity._position)) {
                entities.set(entity.id, entity);
            } else {
                _proxyUpdater = entity._proxyUpdater;
                if (Cesium.defined(_proxyUpdater)) {
                    _proxyUpdater.removeObject(entity);
                }
                entities.remove(entity.id);
            }
        }

        for (i = removed.length - 1; i > -1; i--) {
            entity = removed[i];
            _proxyUpdater = entity._proxyUpdater;
            if (Cesium.defined(_proxyUpdater)) {
                _proxyUpdater.removeObject(entity);
            }
            entities.remove(entity.id);
        }
    };
