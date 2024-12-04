// On document ready
$(document).ready(() => {
    // Get Dept#11 object entries
    $(document).load("https://collectionapi.metmuseum.org/public/collection/v1/search?q=''&hasImage=true&departmentId=11", (response) => {
        const data = JSON.parse(response);
        // For 10 of the first entries in the API response create elements for each
        for(let i=0; i < 10; i++) {
            $("#content").append(`<tr id=${i}></tr>`);
            $(document).load(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${data.objectIDs[i]}`, (response) => {
                const data = JSON.parse(response)
                $("#Department").text(data.department)
                let name = $(`<td></td>`).text(data.title);
                let artist = $(`<td></td>`).text("by " + data.artistDisplayName);
                let creationDate = $(`<td></td>`).text("Date created: " + data.objectDate);
                let description = $('<td></td>').text(data.dimensions)
                let imgHolder = $(`<td id=image-${i}-holder></td>`);
                let img = $(`<img id=image-${i} title="Click to view full size painting." style="width: 400px;" tabindex="0" alt="A thumbnail image of a painting titled '${data.title}' by ${data.artistDisplayName}">`)
                img.attr('src', data.primaryImage)
                $("#" + i).append(imgHolder, name, artist, creationDate, description);
                $(`#image-${i}-holder`).append(img)
                $(`#image-${i}`).attr("onclick", `window.open('${data.primaryImage}', '_blank')`);
            })
        }
    })
})