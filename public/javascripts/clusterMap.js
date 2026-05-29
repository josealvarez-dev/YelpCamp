maptilersdk.config.apiKey = maptilerApiKey;

const campamentosCrudos = document.getElementById('campamentos-data').textContent;
const campamentos = JSON.parse(campamentosCrudos);

const map = new maptilersdk.Map({
    container: 'cluster-map',
    style: maptilersdk.MapStyle.DATAVIZ.LIGHT,
    center: [-75.0152, -9.1900],
    zoom: 4
});

map.on('load', function () {

    map.addSource('campgrounds', {
        type: 'geojson',
        data: {
            features: campamentos
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                30,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                20,
                30,
                25
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

});

// 👇 EVENTOS DE CLIC PARA EL MAPA 👇

// 1. Cuando hacemos clic en una burbuja agrupada (Cluster)
map.on('click', 'clusters', function (e) {
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('campgrounds').getClusterExpansionZoom(
        clusterId,
        function (err, zoom) {
            if (err) return;
            // Hacemos un zoom suave hacia adentro
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        }
    );
});

// 2. Cuando hacemos clic en un puntito solitario (Unclustered Point)
map.on('click', 'unclustered-point', function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    // Sacamos el HTML que preparamos en Mongoose
    const { popUpMarkup } = e.features[0].properties;

    // Aseguramos que el popup salga en el lugar correcto
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Dibujamos el popup
    new maptilersdk.Popup()
        .setLngLat(coordinates)
        .setHTML(popUpMarkup)
        .addTo(map);
});

// 3. Cambiamos el cursor a la "manito" de clic cuando pasamos el mouse por encima
map.on('mouseenter', 'clusters', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
});
map.on('mouseenter', 'unclustered-point', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'unclustered-point', function () {
    map.getCanvas().style.cursor = '';
});