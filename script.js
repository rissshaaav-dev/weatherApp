const apiKey = "a653a8fd3f2874e458e81dfd9bf837c8"; // Replace with your OpenWeather API key
const city = "Sehore"; // Replace with the city you want

async function getWeatherData(city) {
  try {
    // Fetch current weather data
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const currentResponse = await fetch(currentWeatherURL);
    const currentData = await currentResponse.json();

    // Fetch 5-day forecast data
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastURL);
    const forecastData = await forecastResponse.json();

    if (currentData.cod !== 200 || forecastData.cod !== "200") {
      console.error(
        "Error fetching data:",
        currentData.message || forecastData.message
      );
      return;
    }

    // Extract required details from current weather data
    const cityName = currentData.name;
    const todayDate = new Date().toLocaleDateString();
    const currentTemp = currentData.main.temp;
    const windSpeed = currentData.wind.speed;
    const humidity = currentData.main.humidity;
    const feelsLike = currentData.main.feels_like;
    const weatherStatus = currentData.weather[0].main; // Example: Rain, Clouds, Clear
    const precipitation = currentData.rain
      ? (currentData.rain["1h"] || "0") + " mm"
      : "0 mm";

    // Extract temperatures for the next 5 individual days
    const dailyTemps = {};
    forecastData.list.forEach((entry) => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString();

      // Select only midday temperatures (12:00 PM UTC)
      if (date.getUTCHours() === 12) {
        dailyTemps[day] = entry.main.temp;
      }
    });

    // Display results
    console.log(`City: ${cityName}`);
    console.log(`Date: ${todayDate}`);
    console.log(`Current Temp: ${currentTemp}°C`);
    console.log(`Feels Like: ${feelsLike}°C`);
    console.log(`Wind Speed: ${windSpeed} m/s`);
    console.log(`Humidity: ${humidity}%`);
    console.log(`Precipitation: ${precipitation}`);
    console.log(`Weather Status: ${weatherStatus}`);
    console.log("Next 5 Days' Temperatures:");
    Object.entries(dailyTemps)
      .slice(0, 5)
      .forEach(([date, temp]) => {
        console.log(`${date}: ${temp}°C`);
      });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function
getWeatherData(city);
