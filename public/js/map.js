   

mapboxgl.accessToken=mapToken;
    const map = new mapboxgl.Map({
     accessToken: 'pk.eyJ1IjoibmlyYW5qYW5rdW1hciIsImEiOiJjbXE1NG85dzgwMTNoMnBxdzc5cHVhMTB5In0.2oZ3xMhG2Y4kFy8FbvCsIA',
        style:'mapbox://styles/mapbox/streets-v12',
        container: 'map', // container ID
        center: listingData.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9// starting zoom
    });
    const marker = new mapboxgl.Marker({color:'red'})
        .setLngLat(listingData.geometry.coordinates)
        .setPopup( new mapboxgl.Popup({offset: 25, className: 'my-class'})
       // .setLngLat(e.lngLat)
        .setHTML(
            `<h4> ${listingData.title}</h4> <p>Exact Location provided <p> `

        )) //listing geometry coordinates
        .addTo(map);

        