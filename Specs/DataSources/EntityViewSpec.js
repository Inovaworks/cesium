/*global defineSuite*/
defineSuite([
        'DataSources/EntityView',
        'Core/Cartesian3',
        'Core/Ellipsoid',
        'Core/JulianDate',
        'DataSources/ConstantPositionProperty',
        'DataSources/Entity',
        'Specs/createScene',
        'Specs/destroyScene'
    ], function(
        EntityView,
        Cartesian3,
        Ellipsoid,
        JulianDate,
        ConstantPositionProperty,
        Entity,
        createScene,
        destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    it('default constructor sets expected values', function() {
        var view = new EntityView();
        expect(view.ellipsoid).toBe(Ellipsoid.WGS84);
        expect(view.entity).toBeUndefined();
        expect(view.scene).toBeUndefined();
    });

    it('constructor sets expected values', function() {
        var entity = new Entity();
        var ellipsoid = Ellipsoid.UNIT_SPHERE;
        var view = new EntityView(entity, scene, ellipsoid);
        expect(view.entity).toBe(entity);
        expect(view.scene).toBe(scene);
        expect(view.ellipsoid).toBe(Ellipsoid.UNIT_SPHERE);
    });

    it('update throws without time parameter', function() {
        var entity = new Entity();
        entity.position = new ConstantPositionProperty(Cartesian3.ZERO);
        var view = new EntityView(entity, scene);
        expect(function() {
            view.update(undefined);
        }).toThrowDeveloperError();
    });

    it('update throws without entity property', function() {
        var view = new EntityView(undefined, scene);
        expect(function() {
            view.update(JulianDate.now());
        }).toThrowDeveloperError();

    });

    it('update throws without scene property', function() {
        var entity = new Entity();
        entity.position = new ConstantPositionProperty(Cartesian3.ZERO);
        var view = new EntityView(entity, undefined);
        expect(function() {
            view.update(JulianDate.now());
        }).toThrowDeveloperError();
    });

    it('update throws without ellipsoid property', function() {
        var entity = new Entity();
        entity.position = new ConstantPositionProperty(Cartesian3.ZERO);
        var view = new EntityView(entity, scene);
        view.ellipsoid = undefined;
        expect(function() {
            view.update(JulianDate.now());
        }).toThrowDeveloperError();
    });

    it('update throws without entity.position property.', function() {
        var entity = new Entity();
        var view = new EntityView(entity, scene);
        expect(function() {
            view.update(JulianDate.now());
        }).toThrowDeveloperError();
    });
}, 'WebGL');
