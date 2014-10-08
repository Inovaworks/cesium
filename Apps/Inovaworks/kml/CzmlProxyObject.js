     function processCzmlProxyObjectPacket (dynamicObject, packet, dynamicObjectCollection, sourceUri) {
        
        
        var proxyData = packet.proxy;
        console.log(proxyData);
        if (typeof proxyData === 'undefined') {
            return;
        }

        var interval = proxyData.interval;
        if (typeof interval !== 'undefined') {
            interval = Cesium.TimeInterval.fromIso8601(interval);
        }

        var proxy = dynamicObject.proxy;
        if (typeof proxy === 'undefined') {
            dynamicObject.proxy = proxy = new ProxyGraphics();
        }

        Cesium.CzmlDataSource.processPacketData(Boolean, proxy, 'show', proxyData.show, interval, sourceUri);
        Cesium.CzmlDataSource.processPacketData(Number, proxy, 'rotation', proxyData.rotation, interval, sourceUri);
        //Cesium.CzmlDataSource.processPositionPacketData(dynamicObject, 'position', proxyData.position, interval, sourceUri);

         // TODO: should clone instead of assign
        proxy.objects = proxyData.objects;        
    }   
