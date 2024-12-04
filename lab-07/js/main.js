$(document).ready(() => {
   

    $(document).load("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02", (response) => {
        items = JSON.parse(response);
        console.log(items.features)
        for(let i = 0; i < 10; i++) {
            console.log(items.features[i].properties.title)
                const tickerItem = $("<a class='ticker-item'></a>").text(items.features[i].properties.title + " has a magnitude of " + items.features[i].properties.mag + " magnitude");
                tickerItem.attr("href", items.features[i].properties.url);
                tickerItem.attr("target", "_blank");
                console.log(Number.parseFloat(items.features[i].properties.mag));
                if (Number.parseFloat(items.features[i].properties.mag) > 2.0) {
                    tickerItem.css("background-color", "red");
                }
                $("#ticker-transition").append(tickerItem);
        }
    });

    $(document).load("http://api.open-notify.org/iss-now.json", (response) => {
        let data = JSON.parse(response)
        console.log(data)

        console.log(data.latitude)
        console.log(data.longitude)
        $("#iss-location").html(`Tracking ISS Space Station:    Lat:${data.latitude}, Lon:${data.longitude}`);
    });



    

    $(document).load("https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries", (response) => {
        const data = JSON.parse(response).DisasterDeclarationsSummaries;
        console.log(data)
        for(i = 0; i < 30; i++) {
            const incidentType = data[i].incidentType;
            const incidentTitle = data[i].declarationTitle;
            const incidentLoc = data[i].state;
            let incident;
            
        
            incident = $("<li class='isUp'></li>").html(`${incidentType}:${incidentTitle} in ${incidentLoc}`)
            

            $("#news").append(incident);
        }
    });
});