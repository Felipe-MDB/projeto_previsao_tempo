const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const forecast = document.getElementById("forecast");

const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const GEOCODING_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_URL =
    "https://api.open-meteo.com/v1/forecast";


// EVENTOS

searchBtn.addEventListener(
    "click",
    getWeather
);

locationBtn.addEventListener(
    "click",
    getLocationWeather
);

themeBtn.addEventListener(
    "click",
    toggleTheme
);

cityInput.addEventListener(
    "keypress",
    (event) => {

        if (event.key === "Enter") {
            getWeather();
        }
    }
);


// BUSCAR POR CIDADE

async function getWeather() {

    const city = cityInput.value.trim();

    if (!city) {
        weatherResult.innerHTML =
            "<p>Digite uma cidade.</p>";
        return;
    }

    localStorage.setItem(
        "lastCity",
        city
    );

    weatherResult.innerHTML =
        "<p>⏳ Buscando clima...</p>";

    forecast.innerHTML = "";

    try {

        const geoResponse = await fetch(
            `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {

            weatherResult.innerHTML = `
                <div class="weather-main">
                    ❌ Cidade não encontrada
                </div>
            `;

            return;
        }

        const location =
            geoData.results[0];

        await loadWeather(
            location.latitude,
            location.longitude,
            location.name
        );

    } catch (error) {

        console.error(error);

        weatherResult.innerHTML = `
            <div class="weather-main">
                ❌ Erro ao buscar clima
            </div>
        `;
    }
}


// BUSCAR POR GEOLOCALIZAÇÃO

function getLocationWeather() {

    weatherResult.innerHTML =
        "<p>📍 Obtendo localização...</p>";

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            await loadWeather(
                latitude,
                longitude,
                "Sua Localização"
            );
        },

        () => {

            weatherResult.innerHTML = `
                <div class="weather-main">
                    ❌ Permissão de localização negada
                </div>
            `;
        }
    );
}


// CARREGA O CLIMA

async function loadWeather(
    latitude,
    longitude,
    cityName
) {

    const weatherResponse = await fetch(
        `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    const weatherData =
        await weatherResponse.json();

    const current =
        weatherData.current;

    const icon =
        getWeatherIcon(
            current.weather_code
        );

    const now =
        new Date().toLocaleString(
            "pt-BR"
        );

    weatherResult.innerHTML = `

        <div class="weather-main">

            <div class="weather-icon">
                ${icon}
            </div>

            <div class="temperature">
                ${current.temperature_2m}°C
            </div>

            <div class="city-name">
                ${cityName}
            </div>

            <div class="weather-info">
                <span>
                    💧 ${current.relative_humidity_2m}%
                </span>

                <span>
                    🌬 ${current.wind_speed_10m} km/h
                </span>
            </div>

            <p style="margin-top:15px;">
                🕒 ${now}
            </p>

        </div>
    `;

    renderForecast(weatherData);
}


// PREVISÃO

function renderForecast(weatherData) {

    let forecastHTML = "";

    for (
        let i = 0;
        i < weatherData.daily.time.length;
        i++
    ) {

        const day =
            new Date(
                weatherData.daily.time[i]
            ).toLocaleDateString(
                "pt-BR",
                {
                    weekday: "short"
                }
            );

        forecastHTML += `
            <div class="forecast-day">

                <span>
                    ${day}
                </span>

                <span>
                    🔺 ${weatherData.daily.temperature_2m_max[i]}°
                    🔻 ${weatherData.daily.temperature_2m_min[i]}°
                </span>

            </div>
        `;
    }

    forecast.innerHTML = `

        <h3 style="
            margin-top:20px;
            margin-bottom:10px;
        ">
            📅 Próximos 7 Dias
        </h3>

        ${forecastHTML}
    `;
}


// ÍCONES

function getWeatherIcon(code) {

    if (code === 0)
        return "☀️";

    if (code <= 3)
        return "⛅";

    if (code <= 67)
        return "🌧️";

    if (code <= 77)
        return "❄️";

    return "🌥️";
}


// MODO ESCURO

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );
}


// RECUPERA ÚLTIMA CIDADE

window.addEventListener(
    "load",
    () => {

        const lastCity =
            localStorage.getItem(
                "lastCity"
            );

        if (lastCity) {

            cityInput.value =
                lastCity;
        }
    }
);