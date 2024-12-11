// wait until document is ready and loaded before executing anything
$(document).ready(() => {
	let weatherCodes = null;
	// Get reference to forecast-wrapper for appending elements to.
	const forecastContainer = $("#forecast-container");
	const forecastWrapper = $("#forecast-wrapper");

	// Get images/data for weather codes provided by weather api to display weather(sunny/rainy/snowy/fog/drizzle) based on the weather-codes.json file
	fetch("js/weather-codes.json")
		.then((response) => {
			// Check if request was successful
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json(); // Parse into json and return as data
		})
		.then((data) => {
			weatherCodes = data;

			// call handleForecastSearch once data is loaded and ready
			handleForecastSearch();

			// Set up the search button event listener only after the data is loaded
			$("#searchForecastBtn").on("click", handleForecastSearch);

			// Event listener for checkbox change (temperature unit change)
			$("#temperature-unit").on("change", handleForecastSearch);

			// Event listener for checkbox change (wind unit change)
			$("#wind-unit").on("change", handleForecastSearch);

			// Event listener for checkbox change (precipitation unit change)
			$("#precipitation-unit").on("change", handleForecastSearch);

			// Event listener for dropdown change (forecast type selection)
			$("#forecast-options").on("change", handleForecastSearch);
		})
		.catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
		});

	/**
	 * Main function that executes when searching, changing units or forecast options, and when using the browsers
	 * navigator api to search for the forecasts.
	 *
	 * @returns void
	 */
	async function handleForecastSearch() {
		// Initialize lat, long, and location variables to use globally
		let latitude;
		let longitude;
		let location;

		// Make sure weatherCodes fetch is fully loaded before continuing
		if (!weatherCodes) {
			console.error("Weather codes are not loaded yet");
			return;
		}

		// Get location from user search input OR get from user client device location from navigator browser api.
		let queryLocation = $("#searchInput").val().trim();

		if (!queryLocation) {
			// if nothing is searched, use browser gelocation
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(getPosition);
			} else {
				console.log("Geolocation is not supported by this browser.");
			}
		} else if (!isNaN(queryLocation)) {
			window.alert("Please enter a valid location.");
		} else {
			getCoordinatesFromQuery(queryLocation);
		}

		/**
		 * Get latitude and longitude from search input / query
		 *
		 * @param {any} position
		 */
		function getPosition(position) {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			makeWeatherApiCall(latitude, longitude);
			getLocationFromCoordinates(latitude, longitude);
		}

		/**
		 * Get latitude and longitude from search input / query
		 *
		 * @param {string} queryLocation
		 */
		function getCoordinatesFromQuery(queryLocation) {
			$.ajax(
				`https://us1.locationiq.com/v1/search?key=pk.d8454b1e854370aee9f8ee2ae06bb7f6&q=${queryLocation}&format=json`,
				{
					method: "GET",
					dataType: "json",
					success: (response) => {
						latitude = response[0].lat;
						longitude = response[0].lon;
						makeWeatherApiCall(latitude, longitude);
						getLocationFromCoordinates(latitude, longitude);
					},
					error: (error) => {
						console.log("Error fetching location data." + error);
					},
				}
			);
		}

		/**
		 * Gets the actual location name from latitude and longitude coordinates using reverse geocoding api
		 *
		 * @param {number} latitude
		 * @param {number} longitude
		 */
		function getLocationFromCoordinates(latitude, longitude) {
			$.ajax(
				`https://us1.locationiq.com/v1/reverse?key=pk.d8454b1e854370aee9f8ee2ae06bb7f6&lat=${latitude}&lon=${longitude}&format=json`,
				{
					method: "GET",
					dataType: "json",
					success: (response) => {
						location = response.address.city + ", " + response.address.state;
						makeWeatherApiCall(latitude, longitude, location);
					},
					error: (error) => {
						console.log("Error fetching location data." + error);
					},
				}
			);
		}

		/**
		 * Main function that creates and handles all Api Calls
		 *
		 * @param {number} latitude
		 * @param {number} longitude
		 * @param {string} location
		 * @returns void
		 */
		function makeWeatherApiCall(latitude, longitude, location) {
			forecastContainer.show();
			// Unit selection ternarary operators
			let tempUnit = $("#temperature-unit").prop("checked")
				? "&temperature_unit=fahrenheit"
				: "";
			let windUnit = $("#wind-unit").prop("checked")
				? "&wind_speed_unit=mph"
				: "";
			let precipitationUnit = $("#precipitation-unit").prop("checked")
				? "&precipitation_unit=inch"
				: "";

			// make formattedDate
			let d = new Date();
			let formattedDate = d.toLocaleDateString("en-GB", {
				weekday: "long",
				day: "2-digit",
				month: "short",
				year: "numeric",
			});

			// Empty out info div before inserting new information
			$("#info").empty();

			// Create location and time divs
			const locationDiv = $("<div id='location'></div>");
			locationDiv.text(location);
			const timeDiv = $("<div id='time'></div>");
			timeDiv.text(formattedDate);

			// Append location and time divs to the info div
			$("#info").append(locationDiv).append(timeDiv);

			// Get the value from the drop-down select element
			const dropdownSelection = $("#forecast-options").find(":selected").text();

			let forecastUrl = ""; // This will hold the URL for the API request
			let forecastParams = ""; // This will hold the parameters for (hourly, daily, weekly.)

			// Determine which forecast to request based on the selected dropdown option
			switch (dropdownSelection) {
				case "Hourly":
					console.log("Hourly forecast selected.");
					forecastUrl = `https://api.open-meteo.com/v1/forecast`;
					forecastParams = `latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&models=best_match&timezone=auto${tempUnit}${windUnit}${precipitationUnit}`;
					break;
				case "Daily":
					console.log("Daily forecast selected.");
					forecastUrl = `https://api.open-meteo.com/v1/forecast`;
					forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_probability_max&forecast_days=1&models=best_match&timezone=auto${tempUnit}${windUnit}${precipitationUnit}`;
					break;
				case "Weekly":
					console.log("Weekly forecast selected.");
					forecastUrl = `https://api.open-meteo.com/v1/forecast`;
					forecastParams = `latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_probability_max&forecast_days=10&models=best_match&timezone=auto${tempUnit}${windUnit}${precipitationUnit}`;
					break;
				default:
					console.error("Invalid option selected");
					return; // Exit if no valid option is selected
			}

			// Make Weather API Call with the defined parameters
			$.ajax(`${forecastUrl}?${forecastParams}`, {
				method: "GET",
				dataType: "json",
				success: (response) => {
					handleWeatherResponse(response, dropdownSelection);
				},
				error: (error) => {
					console.error(error);
				},
			});
		}

		/**
		 * Helper function that handles the response from the api and renders the correct forecast
		 * based on the response and forecastType.
		 *
		 * @param {object} response
		 * @param {string} forecastType
		 */
		function handleWeatherResponse(response, forecastType) {
			// Clear div of previous forecasts
			forecastWrapper.empty();

			// call render
			switch (forecastType) {
				case "Hourly":
					renderHourlyForecast(response);
					break;
				case "Daily":
					renderDailyForecast(response);
					break;
				case "Weekly":
					renderWeeklyForecast(response);
					break;
			}
		}

		/**
		 * function that generates the specific forecastTypes details to be rendered and put inside each forecast card
		 *
		 * @param {Array} categories
		 * @param {object} response
		 * @param {number} i
		 * @returns void
		 */
		function generateForecastDetails(categories, response, i) {
			const detailsDivContainer = $('<div class="row"></div>');

			categories.forEach((category, index) => {
				const detailsDivChild = $(
					'<div class="col d-flex flex-column align-items-center"></div>'
				).attr("id", category.className + "-" + i);

				// Title Element
				const titleElem = $(
					'<div class="category-title h-auto w-full fs-6 text-center mx-auto row justify-content-center overflow-hidden"></div>'
				).text(category.label);

				// SVG Element
				const svg = $(
					'<img class="category-icon mx-auto row justify-content-center ">'
				).attr("src", category.icon);

				// Value Element
				const elem = $(
					'<div class="category-value h-auto w-full fs-6 text-center mx-auto row justify-content-center overflow-hidden"></div>'
				).text(category.value(response, i));

				// Append elements to details
				detailsDivChild.append(titleElem).append(svg).append(elem);

				// Add this column to the container
				detailsDivContainer.append(detailsDivChild);
			});

			return detailsDivContainer;
		}

		// RENDER FORECAST CODE TO DOM CODE //

		/**
		 * function that takes in a response for the hourly forecast and manipulates the data and creates and manipulates html elements to display the correct data.
		 *
		 * @param {object} response
		 */
		function renderHourlyForecast(response) {
			console.log(response);

			// set units for each category
			let unitTemp = $("#temperature-unit").prop("checked") ? " F°" : " C°";
			let unitWind = $("#wind-unit").prop("checked") ? " mph" : " km/h";
			let unitVisibility = $("#precipitation-unit").prop("checked")
				? " in"
				: " m";
			// Loop through hourly data
			for (let i = 0; i < 24; i++) {
				let forecastDiv = $(
					'<div class="forecast-card" id="forecast-' + i + '"></div>'
				);

				let amOrPm = "";

				let timeString = response.hourly.time[i].split("T")[1];
				let hour = parseInt(timeString.split(":")[0]);

				// Convert Military time to 12-hour format and set AM/PM
				if (hour >= 12) {
					amOrPm = "PM";
					if (hour > 12) {
						hour -= 12; // Convert hours 13-23 to 1-11 PM
					}
				} else {
					amOrPm = "AM";
					if (hour === 0) {
						hour = 12; // for midnight
					}
				}

				// Formatted time for the hourly time on the forecast cards
				let formattedTime = hour + ":" + timeString.split(":")[1] + "" + amOrPm;

				// Create time and temperature divs inside forecastDiv
				let timeElem = $('<div class="time position-absolute"></div>').text(
					formattedTime
				);
				let tempElem = $('<div class="temp"></div>').text(
					response.hourly.temperature_2m[i] + unitTemp
				);
				forecastDiv.append(timeElem).append(tempElem);

				// categories array for defining the details of the forecast
				const categories = [
					{
						label: "Relative Humidity",
						icon: "images/wi-humidity.svg",
						className: "humidity",
						value: (res, idx) => res.hourly.relative_humidity_2m[idx] + "%",
					},
					{
						label: "Precipitation Probability",
						icon: "images/wi-raindrop.svg",
						className: "precipProbability",
						value: (res, idx) =>
							res.hourly.precipitation_probability[idx] + "%",
					},
					{
						label: "Cloud Cover",
						icon: "images/wi-cloud.svg",
						className: "cloudCover",
						value: (res, idx) => res.hourly.cloud_cover[idx] + "%",
					},
					{
						label: "Visibility",
						icon: "images/visibility.svg",
						className: "visibility",
						value: (res, idx) => res.hourly.visibility[idx] + unitVisibility,
					},
					{
						label: "Wind Speed",
						icon: "images/wi-windy.svg",
						className: "windSpeed",
						value: (res, idx) => res.hourly.wind_speed_10m[idx] + unitWind,
					},
					{
						label: "Wind Direction",
						icon: "images/wi-wind-deg.svg",
						className: "windDirection",
						value: (res, idx) => {
							// Get the wind direction from response in degrees
							let windDirection = res.hourly.wind_direction_10m[idx];

							// Make all 16 wind directions in a array
							let directions = [
								"N",
								"NNE",
								"NE",
								"ENE",
								"E",
								"ESE",
								"SE",
								"SSE",
								"S",
								"SSW",
								"SW",
								"WSW",
								"W",
								"WNW",
								"NW",
								"NNW",
							];

							/* Source for formula:  https://gist.github.com/theKAKAN/b40bf54144a6eb90313ad00681e3fbcc */
							let directionIndex = parseInt(windDirection / 22.5 + 0.5) % 16;
							// Return the corresponding cardinal direction and degrees
							return directions[directionIndex] + " (" + windDirection + "°)";
						},
					},
					{
						label: "Wind Gusts",
						icon: "images/wi-wind-beaufort-0.svg",
						className: "windGusts",
						value: (res, idx) => res.hourly.wind_gusts_10m[idx] + unitWind,
					},
				];

				const detailsDiv = $('<div class=""></div>');
				detailsDiv.append(generateForecastDetails(categories, response, i));

				// Handle weather codes and displaying images while setting description (condition) text.
				let weatherCode = response.hourly.weather_code[i];
				let weatherCodeString = weatherCode.toString().padStart(2, "0");

				let conditionElem = $('<div class="condition"></div>');
				if (weatherCodes[weatherCodeString]) {
					conditionElem.text(weatherCodes[weatherCodeString].description);

					let imageContainer = $('<div class="weather-img-container"></div>');

					let weatherImg = $(`<img id="weatherImg-${i}" />`)
						.attr("src", `${weatherCodes[weatherCodeString].image}`)
						.css({ width: "64px", height: "64px" });

					imageContainer.append(weatherImg);
					forecastDiv.append(imageContainer); // Append the image to the forecast card
				} else {
					conditionElem.text("Weather condition not available");
				}

				//append final elements together and append to forecast-wrapper
				forecastDiv.append(conditionElem); // Append the condition text
				forecastDiv.append($("<hr>"));
				forecastDiv.append(detailsDiv);
				forecastWrapper.append(forecastDiv); // Append the forecast card to the wrapper
			}
		}

		/**
		 * function that takes in a response for the daily forecast and manipulates the data and creates and manipulates html elements to display the correct data.
		 *
		 * @param {object} response
		 */
		function renderDailyForecast(response) {
			// set units for each category
			let unitTemp = $("#temperature-unit").prop("checked") ? " F°" : " C°";
			let unitWind = $("#wind-unit").prop("checked") ? " mph" : " km/h";
			let unitPrecipitation = $("#precipitation-unit").prop("checked")
				? " in"
				: " mm";
			// Loop through daily data
			for (let i = 0; i < 1; i++) {
				let forecastDiv = $(
					'<div class="forecast-card" id="forecast-' + i + '"></div>'
				);

				// make formattedDates
				let d = new Date();
				let formattedDate = d.toLocaleDateString("en-GB", {
					month: "short",
					day: "2-digit",
				});

				let tempElem = $('<div class="temp"></div>').text(
					response.daily.temperature_2m_max[i] +
						unitTemp +
						"/ " +
						response.daily.temperature_2m_min[i] +
						unitTemp
				);
				// categories array for defining the details of the forecast
				const categories = [
					{
						label: "Precipitation Sum",
						icon: "images/wi-raindrop.svg",
						className: "precipitationSum",
						value: (res, idx) =>
							res.daily.precipitation_sum[idx] + unitPrecipitation,
					},
					{
						label: "Precipitation Probability",
						icon: "images/wi-raindrop.svg",
						className: "precipitationProbability",
						value: (res, idx) =>
							res.daily.precipitation_probability_max[idx] + "%",
					},
					{
						label: "Wind Speed Max",
						icon: "images/wi-windy.svg",
						className: "windSpeedMax",
						value: (res, idx) => res.daily.wind_speed_10m_max[idx] + unitWind,
					},
					{
						label: "Wind Direction",
						icon: "images/wi-wind-deg.svg",
						className: "windDirection",
						value: (res, idx) => {
							// Get the wind direction in degrees
							let windDirection = res.daily.wind_direction_10m_dominant[idx];

							// Convert the wind direction to cardinal direction
							let directions = [
								"N",
								"NNE",
								"NE",
								"ENE",
								"E",
								"ESE",
								"SE",
								"SSE",
								"S",
								"SSW",
								"SW",
								"WSW",
								"W",
								"WNW",
								"NW",
								"NNW",
							];

							/* Source for formula:  https://gist.github.com/theKAKAN/b40bf54144a6eb90313ad00681e3fbcc */
							let directionIndex = parseInt(windDirection / 22.5 + 0.5) % 16;

							// Return the corresponding cardinal direction and degrees
							return directions[directionIndex] + " (" + windDirection + "°)";
						},
					},
					{
						label: "Wind Gusts Max",
						icon: "images/wi-wind-beaufort-0.svg",
						className: "windGustsMax",
						value: (res, idx) => res.daily.wind_gusts_10m_max[idx] + unitWind,
					},
				];

				const detailsDiv = $('<div class=""></div>');
				detailsDiv.append(generateForecastDetails(categories, response, i));

				forecastDiv.append(tempElem).append(detailsDiv);

				// Handle weather codes and displaying images while setting description (condition) text.
				let weatherCode = response.daily.weather_code[i];
				let weatherCodeString = weatherCode.toString().padStart(2, "0");

				let conditionElem = $('<div class="condition"></div>');
				if (weatherCodes[weatherCodeString]) {
					conditionElem.text(weatherCodes[weatherCodeString].description);
					let weatherImg = $(`<img id="weatherImg-${i}" />`)
						.attr("src", `${weatherCodes[weatherCodeString].image}`)
						.css({ width: "64px", height: "64px" });

					forecastDiv.append(weatherImg);
				} else {
					conditionElem.text("Weather condition not available");
				}

				//append final elements together and append to forecast-wrapper
				forecastDiv.append(conditionElem); // Append the condition text
				forecastDiv.append($("<hr>"));
				forecastDiv.append(detailsDiv);
				forecastWrapper.append(forecastDiv); // Append the forecast card to the wrapper
			}
		}

		/**
		 * function that takes in a response for the weekly forecast and manipulates the data and creates and manipulates html elements to display the correct data.
		 *
		 * @param {object} response
		 */
		function renderWeeklyForecast(response) {
			// set units for each category
			let unitTemp = $("#temperature-unit").prop("checked") ? " F°" : " C°";
			let unitWind = $("#wind-unit").prop("checked") ? " mph" : " km/h";
			let unitPrecipitation = $("#precipitation-unit").prop("checked")
				? " in"
				: " mm";

			// Loop through weekly data
			for (let i = 0; i < 10; i++) {
				let forecastDiv = $(
					'<div class="forecast-card" id="forecast-' + i + '"></div>'
				);

				// Create time and temperature divs inside forecastDiv
				let timeElem = $('<div class="time position-absolute"></div>').text(
					response.daily.time[i].split("-").slice(1)[0] +
						"-" +
						response.daily.time[i].split("-").slice(1)[1]
				);
				let tempElem = $('<div class="temp"></div>').text(
					response.daily.temperature_2m_max[i] +
						unitTemp +
						"/ " +
						response.daily.temperature_2m_min[i] +
						unitTemp
				);

				forecastDiv.append(timeElem).append(tempElem);
				// categories array for defining the details of the forecast
				const categories = [
					{
						label: "Precipitation Sum",
						icon: "images/wi-raindrop.svg",
						className: "precipitationSum",
						value: (res, idx) =>
							res.daily.precipitation_sum[idx] + unitPrecipitation,
					},
					{
						label: "Precipitation Probability",
						icon: "images/wi-raindrop.svg",
						className: "precipitationProbability",
						value: (res, idx) =>
							res.daily.precipitation_probability_max[idx] + "%",
					},
					{
						label: "Wind Speed Max",
						icon: "images/wi-windy.svg",
						className: "windSpeedMax",
						value: (res, idx) => res.daily.wind_speed_10m_max[idx] + unitWind,
					},
					{
						label: "Wind Direction",
						icon: "images/wi-wind-deg.svg",
						className: "windDirection",
						value: (res, idx) => {
							// Get the wind direction in degrees
							let windDirection = res.daily.wind_direction_10m_dominant[idx];

							// Convert the wind direction to cardinal direction
							let directions = [
								"N",
								"NNE",
								"NE",
								"ENE",
								"E",
								"ESE",
								"SE",
								"SSE",
								"S",
								"SSW",
								"SW",
								"WSW",
								"W",
								"WNW",
								"NW",
								"NNW",
							];

							/* Source for formula:  https://gist.github.com/theKAKAN/b40bf54144a6eb90313ad00681e3fbcc */
							let directionIndex = parseInt(windDirection / 22.5 + 0.5) % 16;

							// Return the corresponding cardinal direction and degrees
							return directions[directionIndex] + " (" + windDirection + "°)";
						},
					},
					{
						label: "Wind Gusts Max",
						icon: "images/wi-wind-beaufort-0.svg",
						className: "windGustsMax",
						value: (res, idx) => res.daily.wind_gusts_10m_max[idx] + unitWind,
					},
				];

				const detailsDiv = $('<div class=""></div>');
				detailsDiv.append(generateForecastDetails(categories, response, i));

				// Handle weather codes and displaying images while setting description (condition) text.
				let weatherCode = response.daily.weather_code[i];
				let weatherCodeString = weatherCode.toString().padStart(2, "0");

				let conditionElem = $('<div class="condition"></div>');
				if (weatherCodes[weatherCodeString]) {
					conditionElem.text(weatherCodes[weatherCodeString].description);
					let weatherImg = $(`<img id="weatherImg-${i}" />`)
						.attr("src", `${weatherCodes[weatherCodeString].image}`)
						.css({ width: "64px", height: "64px" });

					forecastDiv.append(weatherImg);
				} else {
					conditionElem.text("Weather condition not available");
				}

				//append final elements together and append to forecast-wrapper
				forecastDiv.append(conditionElem); // Append the condition text
				forecastDiv.append($("<hr>"));
				forecastDiv.append(detailsDiv);
				forecastWrapper.append(forecastDiv); // Append the forecast card to the wrapper
			}
		}
	}
});
