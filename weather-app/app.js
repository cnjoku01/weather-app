// List of iconic landmarks for major cities
const landmarks = {
    "paris": "the Eiffel Tower and the surrounding area in Paris",
    "new york": "Times Square or Central Park in New York City",
    "london": "the Big Ben and the River Thames in London",
    "tokyo": "Shibuya Crossing and Tokyo Tower",
    "rome": "the Colosseum in Rome",
    "sydney": "the Sydney Opera House and Harbour Bridge",
    "san francisco": "the Golden Gate Bridge",
    // Add more iconic locations for other major cities
};

// Function to generate an image using OpenAI's Generative AI API
async function generateGenAIImage(location, weather, temperature, timeOfDay) {
    const apiKey = 'my openAI key';  // Replace this with your OpenAI API key
    const url = 'https://api.openai.com/v1/images/generations';  // OpenAI API URL

    // Check if location has a specific landmark
    const locationKey = location.toLowerCase();
    let landmark = landmarks[locationKey] || `a familiar area in ${location}`;  // Use a default phrase if no specific landmark is found

    // Create more detailed prompts based on the weather, location, landmark, and time of day
    let prompt = `A realistic ${timeOfDay} scene at ${landmark}, where it is ${weather}.`;

    // Add specific details based on weather conditions
    if (weather.includes("snow")) {
        prompt += ` People are walking through the snow, wearing winter coats, scarves, and hats.`;
    } else if (weather.includes("rain")) {
        prompt += ` People are walking with umbrellas, wearing raincoats. The streets are wet and reflecting the city lights.`;
    } else if (weather.includes("clear") || weather.includes("sunny")) {
        prompt += ` People are enjoying the sunny weather, wearing light clothing.`;
    } else if (weather.includes("cloud")) {
        prompt += ` The sky is overcast, and people are walking around, some holding jackets.`;
    } else if (weather.includes("storm")) {
        prompt += ` A storm is brewing. People are rushing indoors, with dark clouds covering the sky.`;

    }

    prompt += ` The temperature is ${temperature}°F.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,  // Send the detailed prompt
                n: 1,  // Number of images
                size: "1024x1024"  // Image size
            })
        });

        const data = await response.json();
        console.log("OpenAI API Response:", data);  // Log the full API response

        if (data && data.data && data.data[0].url) {
            return data.data[0].url;  // Return the generated image URL
        } else {
            throw new Error(`Failed to generate image: ${data.error ? data.error.message : 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error generating AI image:', error);
        throw new Error(`Error with OpenAI API: ${error.message}`);
    }
}

// Fetch weather data, calculate local time, and generate a GenAI image based on location, weather, and time
document.getElementById('weatherForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const location = document.getElementById('locationInput').value;
    const apiKey = 'a99e8ddab2f8e5519fdaf0379724a05f';  // Your OpenWeather API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`;

    document.getElementById('weatherResult').innerHTML = `<div class="loader"></div>`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod === 200) {
            const weather = data.weather[0].description;  // e.g., "clear sky", "snow"
            const temperature = data.main.temp;
            const feelsLike = data.main.feels_like;
            const windSpeed = data.wind.speed;
            const humidity = data.main.humidity;
            const timezoneOffset = data.timezone;  // Timezone offset in seconds
            const icon = data.weather[0].icon;

            // Calculate local time using timezone offset
            const utcTime = new Date();
            const localTime = new Date(utcTime.getTime() + timezoneOffset * 1000);  // Adjust for local timezone

            // Determine time of day
            const hours = localTime.getUTCHours();
            let timeOfDay = 'daytime';
            if (hours >= 18 || hours < 6) {
                timeOfDay = 'night';  // Night time between 6 PM and 6 AM
            }

            // Display weather information
            document.getElementById('weatherResult').innerHTML = `
                <p>Weather in ${location}: ${weather}</p>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${weather}">
                <p>Temperature: ${temperature}°F</p>  <!-- Display Fahrenheit -->
                <p>Feels Like: ${feelsLike}°F</p>
                <p>Wind Speed: ${windSpeed} mph</p>
                <p>Humidity: ${humidity}%</p>
                <p>Generating AI image based on weather and time of day (${timeOfDay})...</p>
            `;

            // Call the AI image generator with time of day and detailed prompt
            const imageUrl = await generateGenAIImage(location, weather, temperature, timeOfDay);

            // Display the generated AI image
            const imageElement = `<img src="${imageUrl}" alt="Generated AI Image" style="margin-top: 20px; max-width: 100%;">`;
            document.getElementById('weatherResult').innerHTML += imageElement;

        } else {
            document.getElementById('weatherResult').textContent = `Error: ${data.message}`;
        }

    } catch (error) {
        console.error('Error fetching weather or generating image:', error);
        document.getElementById('weatherResult').textContent = `Failed to fetch weather or generate image: ${error.message}`;
    }
});


