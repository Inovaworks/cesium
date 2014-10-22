    "use strict";
    /**
     * An optionally time-dynamic cone.
     *
     * @alias ProxyGraphics
     * @constructor
     */
    var ProxyGraphics = function() {
        this._objects = undefined;
        this._show = undefined;
        this._definitionChanged = new Cesium.Event();
    };

    Cesium.defineProperties(ProxyGraphics.prototype, {
        /**
         * Gets the event that is raised whenever a new property is assigned.
         * @memberof ProxyGraphics.prototype
         *
         * @type {Event}
         * @readonly
         */
        definitionChanged : {
            get : function() {
                return this._definitionChanged;
            }
        },

        /**
         * Gets or sets the proxy objects.
         * @memberof ProxyGraphics.prototype
         * @type {Property}
         */
        objects : Cesium.createPropertyDescriptor('objects'),

        scale : Cesium.createPropertyDescriptor('scale'),
        rotation : Cesium.createPropertyDescriptor('rotation'),
        
        /**
         * Gets or sets the boolean {@link Property} specifying the visibility of the objects
         * @memberof ProxyGraphics.prototype
         * @type {Property}
         */
        show : Cesium.createPropertyDescriptor('show')

    });

    /**
     * Duplicates a ProxyGraphics instance.
     *
     * @param {ProxyGraphics} [result] The object onto which to store the result.
     * @returns {ProxyGraphics} The modified result parameter or a new instance if one was not provided.
     */
    ProxyGraphics.prototype.clone = function(result) {
        if (!defined(result)) {
            result = new ProxyGraphics();
        }
        
        result.show = this.show;
        result.objects = this.objects;
        result.rotation = this.rotation;
        result.scale = this.scale;
        return result;
    };

    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     *
     * @param {ProxyGraphics} source The object to be merged into this object.
     */
    ProxyGraphics.prototype.merge = function(source) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(source)) {
            throw new DeveloperError('source is required.');
        }
        //>>includeEnd('debug');

        this.show = defaultValue(this.show, source.show);
        this.scale = defaultValue(this.scale, source.scale);   
        this.rotation = defaultValue(this.rotation, source.rotation);   
        this.objects = defaultValue(this.objects, source.objects);
    };

