

    /**
     * A renderable pipe.
     *
     * @alias ProxyPrimitive
     * @constructor
     *
     *  Position:       Cartesian3 (position in globe)
     *  Model:          Model to display
     *  Billboard:      Billboard to display (must be created from BillboardCollection.add() first)
     *  Options:        
     *      distance        Distance to change between billboard & model
     *      fadeDistance    Not working yet
     */
    var ProxyPrimitive = function(position, model, billboard, options) {

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._position = position;
        this._model = model;
        this._billboard = billboard;
        this._swapDistance = Cesium.defaultValue(options.distance, 100000.0);
        this._fadeDistance = Cesium.defaultValue(options.fadeDistance, 10000.0);
        this._ellipsoid = ellipsoid;


        /**
         * Determines if this primitive will be shown.
         *
         * @type Boolean
         *
         * @default true
         */
        this.show = Cesium.defaultValue(options.show, true);


        /**
         * Determines if the geometry instances will be created and batched on
         * a web worker.
         *
         * @type Boolean
         *
         * @default true
         */
        this.asynchronous = Cesium.defaultValue(options.asynchronous, false);

        /**
         * This property is for debugging only; it is not for production use nor is it optimized.
         * <p>
         * Draws the bounding sphere for each {@link DrawCommand} in the primitive.
         * </p>
         *
         * @type {Boolean}
         *
         * @default false
         */
        this.debugShowBoundingVolume = Cesium.defaultValue(options.debugShowBoundingVolume, false);
    };

    /**
     * @private
     */
    ProxyPrimitive.prototype.update = function(context, frameState, commandList) {
        if (!this.show) {
            return;
        }

        this._distanceToCamera = Cesium.Cartesian3.distance(this._position, frameState.camera.position);
        
        var alpha = (this._distanceToCamera - this._swapDistance) / this._fadeDistance;
        if (alpha<0.0) {
            alpha = 0.0;
        }
        else
        if (alpha>1.0) {
            alpha = 1.0;
        }
        
        alpha = 0.5;
         
        
        //console.log ( 'distance: '+this._distanceToCamera  );
        //console.log ( 'alpha: '+alpha  );
                        
        if (this._distanceToCamera<this._swapDistance){
        
            if (this._model.ready) {
                if (!Cesium.defined(this._materials))
                {
                    this._materials = this._model.getMaterials();
                }
                
                /*var obj = this._materials;
                for (var mat in obj) {
                    if (obj.hasOwnProperty(mat)) {
                        obj[mat].setValue('alpha', alpha);
                    }
                } */               
            }        
            
            //this._model._material.update(context);
            this._model.show = true;
            this._billboard.show = false;

            this._model.update(context, frameState, commandList);
        }
        else {

            this._model.show = false;
            this._billboard.show = true;
            //this._billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1.0 - alpha);
            
            //this._billboard.update(context, frameState, commandList);
        }

     };


    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof ProxyPrimitive
     *
     * @returns {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     *
     * @see Rectangle#destroy
     */
    ProxyPrimitive.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof ProxyPrimitive
     *
     * @returns {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see ProxyPrimitive#isDestroyed
     *
     */
    ProxyPrimitive.prototype.destroy = function() {
        return Cesium.destroyObject(this);
    };
