let weatherCodes = null;

// Get images/data for weather codes provided by weather api to display weather(sunny/rainy/snowy/fog/drizzle)
fetch("images/weather-codes.json")
	.then((response) => {
		// Check if the request was successful
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json(); // Parse the JSON content
	})
	.then((data) => {
		weatherCodes = data;
		console.log(data); // Log the JSON data to the console

		// Set up the button event listener only after the data is loaded
		$("#searchForecastBtn").on("click", handleForecastSearch);
	})
	.catch((error) => {
		console.error("There was a problem with the fetch operation:", error);
	});

// When search button is clicked:
function handleForecastSearch() {
	console.log(weatherCodes);

	// Make sure weatherCodes fetch is loaded before continuing
	if (!weatherCodes) {
		console.error("Weather codes are not loaded yet");
		return;
	}

	// Get location from user input
	let queryLocation = $("#searchInput").val().trim();
	let latitude;
	let longitude;

	// make formattedDates
	let d = new Date();
	let formattedDate = d.toLocaleDateString("en-GB", {
		weekday: "long",
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	// If input isnt a string alert user and reload window page
	// else make the first api call to start search
	if (Number(queryLocation)) {
		alert("Input is not valid... Enter a valid location.");
		window.location.reload();
	} else {
		// Make first API call with coordinates to return a location to use
		$.ajax(
			`https://us1.locationiq.com/v1/search?key=pk.d8454b1e854370aee9f8ee2ae06bb7f6&q=${queryLocation}&format=json`,
			{
				method: "GET",
				dataType: "json",
				success: (response) => {
					latitude = response[0].lat;
					longitude = response[0].lon;
					let location = response[0].display_name.split(",")[0];
					$("#info").text(location + " " + formattedDate);

					// Fetch the selected option from the type dropdown.
					const dropdownSelection = $("#forecast-options")
						.find(":selected")
						.text();
					let option = dropdownSelection;
					$("#weather-type").text(option.toUpperCase());

					// Switch that controls the second API request for weather data based on what type has been picked.
					let forecastUrl = ""; // This will hold the URL for the API request
					let forecastParams = ""; // This will hold the parameters (hourly, daily, etc.)

					// Decide which forecast to request based on the selected  dropdwonoption
					switch (option) {
						case "Hourly":
							console.log("Hourly forecast selected.");
							forecastUrl = `https://api.open-meteo.com/v1/forecast`;
							forecastParams = `latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m`;
							break;
						case "Daily":
							console.log("Daily forecast selected.");
							forecastUrl = `https://api.open-meteo.com/v1/forecast`;
							forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max&forecast_days=1`;
							break;
						case "Weekly":
							console.log("Weekly forecast selected.");
							forecastUrl = `https://api.open-meteo.com/v1/forecast`;
							forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max&forecast_days=10`;
							break;
						default:
							console.error("Invalid option selected");
							return; // Exit if no valid option is selected
					}

					// Make the API request for weather data based on the selected option and location.
					$.ajax(`${forecastUrl}?${forecastParams}`, {
						method: "GET",
						dataType: "json",
						success: (response) => {
							console.log(response);

							// Get reference to forecast-container and forecast-wrapper for appending elements.
							const forecastContainer = $("#forecast-container");
							const forecastWrapper = $("#forecast-wrapper");

							// Clear div of previous results and  button.
							forecastWrapper.empty(); // Clear previous forecasts

							// Loop through the data depending on the selected option
							switch (option) {
								case "Hourly":
									// Loop through hourly data
									for (let i = 0; i < 24; i++) {
										let forecastDiv = $(
											'<div class="forecast-card" id="forecast-' +
												i +
												'"></div>'
										);

										// Create time and temperature divs inside forecastDiv
										let timeElem = $('<div class="time"></div>').text(
											response.hourly.time[i]
										);
										let tempElem = $('<div class="temp"></div>').text(
											response.hourly.temperature_2m[i] + "°"
										);

										const detailsDiv = $("<div class='d-flex justify-content-evenly align-items-center'></div>")
										let relHumiditySvg = $(
											'<img src="images/wi-humidity.svg">'
										);
										let relHumiditiyElem = $(
											'<p class="humidity"></p>'
										).text(
											"Rel. Humidity: " +
												response.hourly.relative_humidity_2m[i] +
												"%"
										);
										let precipitationProbSvg = $(
											'<img src="images/wi-raindrop.svg">'
										);
										let precipitaionProbabilityElem = $(
											'<p class="precipProbability"></p>'
										).text(
											"Precipitation Probability: " +
												response.hourly.precipitation_probability[i] +
												"%"
										);
										let cloudCoverSvg = $(
											'<img src="images/wi-cloud.svg">'
										);
										let cloudCoverElem = $(
											'<p class="cloudCover"></p>'
										).text(
											"Cloud Cover: " + response.hourly.cloud_cover[i] + "%"
										);
										let visibilitySvg = $(
											'<img src="images/eye.png">'
										);
										let visibilityElem = $(
											'<p class="visibility"></p>'
										).text("Visibility" + response.hourly.visibility[i] + "m");
										let windSpeedSvg = $(
											'<img src="images/wi-windy.svg">'
										);
										let windSpeedElem = $('<div class="windSpeed"></div>').text(
											"Wind Speed: " + response.hourly.wind_speed_10m[i] + "mph"
										);
										const windDirectionSvg = $(
											'<img src="images/wi-wind-deg.svg">'
										)
										let windDirectionElem = $(
											'<p class="windDirection"></p>'
										).text(
											"Wind Direction: " +
												response.hourly.wind_direction_10m[i] +
												"°"
										);
										let windGustsSvg = $(
											'<img src="images/wi-wind-beaufort-0.svg">'
										);
										let windGustsElem = $('<p class="windGusts"></p>').text(
											"Wind Gusts: " + response.hourly.wind_gusts_10m[i] + "mph"
										);

										forecastDiv.append(timeElem).append(tempElem);

										// Handle weather codes and displaying images while setting description (condition) text.
										let weatherCode = response.hourly.weather_code[i];
										let weatherCodeString = weatherCode
											.toString()
											.padStart(2, "0");

										let conditionElem = $('<div class="condition"></div>');
										if (weatherCodes[weatherCodeString]) {
											conditionElem.text(
												weatherCodes[weatherCodeString].description
											);

											let imageContainer = $(
												'<div class="weather-img-container"></div>'
											);

											let spinner = $(
												'<img class="spinner" src="images/Ajax_loader_metal_512.gif" alt="loading...">'
											);
											imageContainer.append(spinner);
											forecastDiv.append(imageContainer);

											let weatherImg = $(`<img id="weatherImg-${i}" />`)
												.attr("src", `${weatherCodes[weatherCodeString].image}`)
												.css({ width: "64px", height: "64px" })
												.on("load", function () {
													// Once the image is loaded, hide the spinner and show the image
													spinner.hide();
													$(this).show();
												})
												.on("error", function () {
													// In case of error loading the image, hide the spinner and show an error image
													spinner.hide();
													$(this).attr("src", "images/error_image.png").show(); // You can put an error placeholder here
												});
											imageContainer.append(weatherImg);
											forecastDiv.append(imageContainer); // Append the image to the forecast card
										} else {
											conditionElem.text("Weather condition not available");
										}
										

										//append final elements together and append to forecast-wrapper
										forecastDiv.append(conditionElem); // Append the condition text
										forecastDiv.append($("<hr>"))
										detailsDiv
											.append(relHumiditySvg)
											.append(relHumiditiyElem)
											.append(precipitationProbSvg)
											.append(precipitaionProbabilityElem)
											.append(cloudCoverSvg)
											.append(cloudCoverElem)
											.append(visibilitySvg)
											.append(visibilityElem)
											.append(windSpeedSvg)
											.append(windSpeedElem)
											.append(windDirectionSvg)
											.append(windDirectionElem)
											.append(windGustsSvg)
											.append(windGustsElem);
										forecastDiv.append(detailsDiv);
										forecastWrapper.append(forecastDiv); // Append the forecast card to the wrapper
									}
									break;

								case "Daily":
									// Loop through daily data
									for (let i = 0; i < 1; i++) {
										let forecastDiv = $(
											'<div class="forecast-card" id="forecast-' +
												i +
												'"></div>'
										);

										// Create time and temperature divs inside forecastDiv
										let timeElem = $('<div class="time"></div>').text(
											response.daily.time[i]
										);
										let tempElem = $('<div class="temp"></div>').text(
											response.daily.temperature_2m_max[i] +
												"° / " +
												response.daily.temperature_2m_min[i] +
												"°"
										);
										const detailsDiv = $("<div class='d-flex justify-content-evenly align-items-center'></div>")
										let precipitationSumSvg = $(
											'<img src="images/wi-raindrop.svg">'
										);
										let precipitationSumElem = $(
											'<p class="precipitation-sum"></p>'
										).text(
											"Precipitation Sum: " +
												response.daily.precipitation_sum[i] +
												"%"
										);
										forecastDiv.append(timeElem)
										.append(tempElem)
										.append(detailsDiv)

										// Handle weather codes and displaying images while setting description (condition) text.
										let weatherCode = response.daily.weather_code[i];
										let weatherCodeString = weatherCode
											.toString()
											.padStart(2, "0");

										let conditionElem = $('<div class="condition"></div>');
										if (weatherCodes[weatherCodeString]) {
											conditionElem.text(
												weatherCodes[weatherCodeString].description
											);
											let weatherImg = $(`<img id="weatherImg-${i}" />`)
												.attr("src", `${weatherCodes[weatherCodeString].image}`)
												.css({ width: "64px", height: "64px" });

											forecastDiv.append(weatherImg);
										} else {
											conditionElem.text("Weather condition not available");
										}

										//append final elements together and append to forecast-wrapper
										forecastDiv.append(conditionElem); // Append the condition text
										forecastDiv.append($("<hr>"))
										detailsDiv
											.append(windGustsSvg)
											.append(windGustsElem);
										forecastDiv.append(detailsDiv);
										forecastWrapper.append(forecastDiv); // Append the forecast card to the wrapper
									}
									break;

								case "Weekly":
									// Loop through weekly data
									for (let i = 0; i < 10; i++) {
										let forecastDiv = $(
											'<div class="forecast-card" id="forecast-' +
												i +
												'"></div>'
										);

										// Create time and temperature divs inside forecastDiv
										let timeElem = $('<div class="time"></div>').text(
											response.daily.time[i]
										);
										let tempElem = $('<div class="temp"></div>').text(
											response.daily.temperature_2m_max[i] +
												"° / " +
												response.daily.temperature_2m_min[i] +
												"°"
										);
										forecastDiv.append(timeElem).append(tempElem);

										// Handle weather codes and displaying images while setting description (condition) text.
										let weatherCode = response.daily.weather_code[i];
										let weatherCodeString = weatherCode
											.toString()
											.padStart(2, "0");

										let conditionElem = $('<div class="condition"></div>');
										if (weatherCodes[weatherCodeString]) {
											conditionElem.text(
												weatherCodes[weatherCodeString].description
											);
											let weatherImg = $(`<img id="weatherImg-${i}" />`)
												.attr("src", `${weatherCodes[weatherCodeString].image}`)
												.css({ width: "64px", height: "64px" });

											forecastDiv.append(weatherImg);
										} else {
											conditionElem.text("Weather condition not available");
										}

										//append final elements together and append to forecast-wrapper
										forecastDiv.append(conditionElem);
										forecastWrapper.append(forecastDiv);
									}
									break;
							}
						},
					});
				},
			}
		);
	}
}

function displayHelp() {
	const optionsDiv = $("#options");
	const helpDiv = $(`<div id="helpDiv"></div>`);
	const helpGif = $(`<img src="images/helpGif.gif">`);
	helpGif.css("width", "400px");
	helpGif.css("height", "200px");
	helpGif.css("display", "block");
	helpDiv.css("position", "absolute");
	helpDiv.html(
		"How to Use the Weather Search:<br><br>" +
			"1. Enter a Location: Type a city name or area into the search bar and click 'Search Forecast' <br><br>" +
			"2. Select Forecast Type: Choose whether you want to see the forecast hourly, daily, or weekly. <br><br>" +
			"3. View Weather Data: The weather details, including temperature and conditions (sunny, rainy, etc.), will be displayed. You can also see weather images representing each condition."
	);
	helpDiv.append(helpGif);
	optionsDiv.append(helpDiv);
}

function hideHelp() {
	$("#helpDiv").remove();
}
