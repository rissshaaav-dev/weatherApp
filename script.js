const apiKey = "a653a8fd3f2874e458e81dfd9bf837c8"; // Replace with your OpenWeather API key


// Elements
const cityInput = document.getElementById("city");
const todayDayElement = document.getElementById("todayDay");
const todayDateElement = document.getElementById("todayDate");
const currentTimeElement = document.getElementById("currentTime");
const tempElement = document.getElementById("temp");
const feelsLikeElement = document.getElementById("feelsLikeValue");
const weatherStatusElement = document.getElementById("weatherStatus");
const windElement = document.getElementById("wind");
const humidityElement = document.getElementById("humidity");
const forecastElements = document.querySelectorAll(".weekdays");

// Function to format date and time
function updateDateTime() {
    const now = new Date();
    todayDayElement.textContent = now.toLocaleDateString("en-US", { weekday: "long" });
    todayDateElement.textContent = now.toLocaleDateString("en-GB").replace(/\//g, ".");
    currentTimeElement.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// Function to fetch weather data
async function fetchWeatherData(cityOrCoords) {
    try {
        let currentWeatherURL, forecastURL;
        
        if (typeof cityOrCoords === "string") {
            // Fetch by city name
            currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&units=metric&appid=${apiKey}`;
            forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrCoords}&units=metric&appid=${apiKey}`;
        } else {
            // Fetch by coordinates (latitude & longitude)
            const { lat, lon } = cityOrCoords;
            currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        }

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherURL),
            fetch(forecastURL)
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (currentData.cod !== 200 || forecastData.cod !== "200") {
            throw new Error("City not found. Please enter a valid city.");
        }

        return { currentData, forecastData };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert(error.message);
        return null;
    }
}

// Function to update the current weather UI
function updateCurrentWeather(data) {
    cityInput.value = data.name;
    tempElement.textContent = Math.round(data.main.temp);
    feelsLikeElement.textContent = Math.round(data.main.feels_like);
    weatherStatusElement.textContent = data.weather[0].main;
    windElement.textContent = data.wind.speed;
    humidityElement.textContent = data.main.humidity;
}

// Function to process and extract the next 5 days' forecast
function getFiveDayForecast(forecastData) {
    const dailyTemps = {};

    forecastData.list.forEach((entry) => {
        const date = new Date(entry.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });

        // Select only midday temperatures (12:00 PM UTC) & exclude today
        const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
        if (date.getUTCHours() === 12 && !dailyTemps[day] && day !== today) {
            dailyTemps[day] = {
                temp: Math.round(entry.main.temp),
                status: entry.weather[0].main,
            };
        }
    });

    return Object.entries(dailyTemps).slice(0, 5); // Return only next 5 days
}

// Function to update the forecast UI
function updateForecast(forecast) {
    forecast.forEach((data, i) => {
        forecastElements[i].querySelector(".day").textContent = data[0];
        forecastElements[i].querySelector(".tempForecast span").textContent = data[1].temp;
        forecastElements[i].querySelector(".statusForecast").textContent = data[1].status;
    });
}

// Function to detect user location
function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                await getWeather(coords);
            },
            (error) => {
                console.warn("Geolocation denied or unavailable:", error);
                getWeather("New York"); // Fallback to a default city
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
        getWeather("New York"); // Fallback to a default city
    }
}

// Main function to get and display weather data
async function getWeather(cityOrCoords) {
    const weatherData = await fetchWeatherData(cityOrCoords);
    if (!weatherData) return;

    updateCurrentWeather(weatherData.currentData);
    const fiveDayForecast = getFiveDayForecast(weatherData.forecastData);
    updateForecast(fiveDayForecast);
}

// Event listener for user input
cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        getWeather(cityInput.value.trim());
    }
});

// Initialize
setInterval(updateDateTime, 1000);
updateDateTime();
getUserLocation(); // Detect user location on load
