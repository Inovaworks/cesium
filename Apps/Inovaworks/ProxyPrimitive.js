

    /**
     * A renderable pipe.
     *
     * @alias ProxyPrimitive
     * @constructor
     *
     *  Position:       Cartesian3 (position in globe)
     *  Objects:        Object list (all objects must be sorted by distance)
     *                  Example: {{object: myModel, distance:0;} , {object: myBillboard, distance:10000;}}
     *  Options:        
     *      fadeDistance    Not working yet
     */
    var ProxyPrimitive = function(position, objects, options) {

        //>>includeStart('debug', pragmas.debug);

        if (!Cesium.defined(position)) {
            throw new Cesium.DeveloperError('position is required');
        }

        if (!Cesium.defined(objects)) {
            throw new Cesium.DeveloperError('objects is required');
        }

        //>>includeEnd('debug');
    
        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._position = position;
        this._objects = objects;
        this._fadeDistance = Cesium.defaultValue(options.fadeDistance, 10000.0);


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
        
        /*var alpha = (this._distanceToCamera - this._swapDistance) / this._fadeDistance;
        if (alpha<0.0) {
            alpha = 0.0;
        }
        else
        if (alpha>1.0) {
            alpha = 1.0;
        }
        
        alpha = 0.5;*/
                 
        //console.log ( 'distance: '+this._distanceToCamera  );
        //console.log ( 'alpha: '+alpha  );
        
        var len = this._objects.length;
        var objindex = 0;
        // select current visible object
        for (var i=0; i<len; i++)
        {
            if (this._objects[i].distance<this._distanceToCamera) {
                objindex = i;
            }
            else  {
                break;
            }            
        }
        
        // make it visible
        this._objects[i].object.show = true;
        if (defined(this._objects[i].object.update)) {
            this._objects[i].object.update(context, frameState, commandList);
        }
        
        // fade code disabled for now
        /*
        if (this._model.ready) {
            if (!Cesium.defined(this._materials))
            {
                this._materials = this._model.getMaterials();
            }
            
            var obj = this._materials;
            for (var mat in obj) {
                if (obj.hasOwnProperty(mat)) {
                    obj[mat].setValue('alpha', alpha);
                }              
            } 
         }*/               
                                     
        // hide everything else
        for (var i=0; i<len; i++) {
            if (i!=objindex)
            {
                this._objects[i].object.show = false;
            }        
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
