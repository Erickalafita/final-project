// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resetButton = document.getElementById('reset-button');
const resultsContainer = document.getElementById('results-container');
const resultsGrid = document.getElementById('results-grid');

// Store data
let destinationsData = [];
let countriesData = [];
let templesData = [];
let beachesData = [];

// Fetch destinations data from JSON file
async function fetchDestinations() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        const data = await response.json();
        
        // Store each data category
        destinationsData = data.destinations || [];
        countriesData = data.countries || [];
        templesData = data.temples || [];
        beachesData = data.beaches || [];
        
        console.log('Data loaded successfully:', {
            destinations: destinationsData.length,
            countries: countriesData.length,
            temples: templesData.length,
            beaches: beachesData.length
        });
    } catch (error) {
        console.error('Error fetching destinations data:', error);
    }
}

// Initialize the application
function init() {
    fetchDestinations();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    resetButton.addEventListener('click', resetResults);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    // Search in all data sources
    const filteredResults = {
        // Standard destinations (original format)
        destinations: filterDestinations(searchTerm),
        
        // Filtered countries and their cities
        countries: filterCountries(searchTerm),
        
        // Filtered temples
        temples: filterTemples(searchTerm),
        
        // Filtered beaches
        beaches: filterBeaches(searchTerm)
    };
    
    // Count total results
    const totalResults = 
        filteredResults.destinations.length + 
        filteredResults.countries.length + 
        filteredResults.temples.length + 
        filteredResults.beaches.length;
    
    if (totalResults === 0) {
        showNoResultsMessage();
    } else {
        displayResults(filteredResults);
    }
}

// Filter destinations based on search term (original format)
function filterDestinations(searchTerm) {
    return destinationsData.filter(destination => {
        // Check if the search term matches the type (beach, temple, country, city)
        if (destination.type.toLowerCase().includes(searchTerm) || 
            // Handles plural form of beach
            (searchTerm.includes('beach') && destination.type === 'beach') ||
            // Handles plural form of temple
            (searchTerm.includes('temple') && destination.type === 'temple') ||
            // Check if the search term matches the name or country
            destination.name.toLowerCase().includes(searchTerm) ||
            destination.country.toLowerCase().includes(searchTerm)) {
            return true;
        }
        return false;
    });
}

// Filter countries and cities based on search term
function filterCountries(searchTerm) {
    return countriesData.filter(country => {
        // Check if country name matches
        if (country.name.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Check if any city in this country matches
        const matchingCities = country.cities.filter(city => 
            city.name.toLowerCase().includes(searchTerm) ||
            city.description.toLowerCase().includes(searchTerm)
        );
        
        return matchingCities.length > 0;
    });
}

// Filter temples based on search term
function filterTemples(searchTerm) {
    // Only filter if the search term is related to temples
    if (!searchTerm.includes('temple') && !templesData.some(temple => 
        temple.name.toLowerCase().includes(searchTerm) || 
        temple.description.toLowerCase().includes(searchTerm))) {
        return [];
    }
    
    return templesData.filter(temple =>
        temple.name.toLowerCase().includes(searchTerm) ||
        temple.description.toLowerCase().includes(searchTerm)
    );
}

// Filter beaches based on search term
function filterBeaches(searchTerm) {
    // Only filter if the search term is related to beaches
    if (!searchTerm.includes('beach') && !beachesData.some(beach => 
        beach.name.toLowerCase().includes(searchTerm) || 
        beach.description.toLowerCase().includes(searchTerm))) {
        return [];
    }
    
    return beachesData.filter(beach =>
        beach.name.toLowerCase().includes(searchTerm) ||
        beach.description.toLowerCase().includes(searchTerm)
    );
}

// Display results in the results container
function displayResults(filteredResults) {
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Make results container visible
    resultsContainer.style.display = 'block';
    
    // Create category headers if needed
    let hasAddedDestinations = false;
    let hasAddedCountries = false;
    let hasAddedTemples = false;
    let hasAddedBeaches = false;
    
    // Add destinations from the original format
    if (filteredResults.destinations.length > 0) {
        addCategoryHeader('Recommended Destinations');
        hasAddedDestinations = true;
        
        filteredResults.destinations.forEach(destination => {
            const card = createDestinationCard(destination);
            resultsGrid.appendChild(card);
        });
    }
    
    // Add countries and their cities
    if (filteredResults.countries.length > 0) {
        if (!hasAddedDestinations) {
            addCategoryHeader('Countries and Cities');
            hasAddedCountries = true;
        }
        
        filteredResults.countries.forEach(country => {
            // Add the country
            const countryCard = createCountryCard(country);
            resultsGrid.appendChild(countryCard);
            
            // Add its cities
            country.cities.forEach(city => {
                const cityCard = createCityCard(city, country.name);
                resultsGrid.appendChild(cityCard);
            });
        });
    }
    
    // Add temples
    if (filteredResults.temples.length > 0) {
        if (!hasAddedDestinations && !hasAddedCountries) {
            addCategoryHeader('Temples');
            hasAddedTemples = true;
        }
        
        filteredResults.temples.forEach(temple => {
            const templeCard = createSimpleCard(temple, 'temple');
            resultsGrid.appendChild(templeCard);
        });
    }
    
    // Add beaches
    if (filteredResults.beaches.length > 0) {
        if (!hasAddedDestinations && !hasAddedCountries && !hasAddedTemples) {
            addCategoryHeader('Beaches');
            hasAddedBeaches = true;
        }
        
        filteredResults.beaches.forEach(beach => {
            const beachCard = createSimpleCard(beach, 'beach');
            resultsGrid.appendChild(beachCard);
        });
    }
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Add a category header to the results grid
function addCategoryHeader(title) {
    const header = document.createElement('div');
    header.className = 'category-header';
    header.style.gridColumn = '1 / -1';
    header.style.marginTop = '20px';
    header.style.marginBottom = '15px';
    header.innerHTML = `<h3>${title}</h3>`;
    resultsGrid.appendChild(header);
}

// Create a destination card element (for original format)
function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    // Create current time for the destination if timeZone is available
    let timeHtml = '';
    if (destination.timeZone) {
        try {
            const options = { 
                timeZone: destination.timeZone, 
                hour12: true, 
                hour: 'numeric', 
                minute: 'numeric' 
            };
            const localTime = new Date().toLocaleTimeString('en-US', options);
            timeHtml = `<p><strong>Local Time:</strong> ${localTime}</p>`;
        } catch (error) {
            console.error(`Error getting time for ${destination.name}:`, error);
        }
    }
    
    card.innerHTML = `
        <img src="${destination.imageUrl}" alt="${destination.name}" class="result-image">
        <div class="result-content">
            <h3>${destination.name}</h3>
            <p>${destination.description}</p>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${destination.country}</span>
            </div>
            ${timeHtml}
        </div>
    `;
    
    return card;
}

// Create a card for a country
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.gridColumn = '1 / -1';
    
    card.innerHTML = `
        <div class="result-content" style="padding: 15px;">
            <h3>${country.name}</h3>
            <p>Explore the cities of ${country.name} below.</p>
        </div>
    `;
    
    return card;
}

// Create a card for a city
function createCityCard(city, countryName) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    card.innerHTML = `
        <img src="${city.imageUrl}" alt="${city.name}" class="result-image">
        <div class="result-content">
            <h3>${city.name}</h3>
            <p>${city.description}</p>
        </div>
    `;
    
    return card;
}

// Create a simple card for temples and beaches
function createSimpleCard(item, type) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    card.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}" class="result-image">
        <div class="result-content">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="location">
                <i class="fas fa-${type === 'temple' ? 'gopuram' : 'umbrella-beach'}"></i>
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Show message when no results are found
function showNoResultsMessage() {
    resultsGrid.innerHTML = `
        <div class="no-results">
            <h3>No destinations found</h3>
            <p>Please try a different search term like 'beach', 'temple', 'country', or a city name.</p>
        </div>
    `;
    resultsContainer.style.display = 'block';
}

// Reset search results
function resetResults() {
    searchInput.value = '';
    resultsContainer.style.display = 'none';
    resultsGrid.innerHTML = '';
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init); 