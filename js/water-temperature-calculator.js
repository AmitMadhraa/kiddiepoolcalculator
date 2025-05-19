/**
 * Kiddie Pool Water Temperature Calculator
 * 
 * This script handles the functionality for calculating the estimated time
 * it will take for a kiddie pool to reach a desired temperature.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants for calculations and conversions
    const FAHRENHEIT_TO_CELSIUS = (f) => (f - 32) * (5/9);
    const CELSIUS_TO_FAHRENHEIT = (c) => (c * (9/5)) + 32;
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    
    // Named constants for calculation parameters
    const BASE_AIR_TEMP_F = 65;           // Reference air temperature (°F)
    const AIR_TEMP_SENSITIVITY = 30;      // Range over which air temp has significant effect
    const MIN_AIR_TEMP_FACTOR = 0.5;      // Minimum multiplier for cold air
    const MAX_AIR_TEMP_FACTOR = 1.5;      // Maximum multiplier for hot air
    const BASE_VOLUME_GALLONS = 100;      // Reference pool volume for volume factor
    const MIN_VOLUME_FACTOR = 0.8;        // Minimum multiplier for large pools
    const MAX_VOLUME_FACTOR = 1.2;        // Maximum multiplier for small pools
    
    // Warming rate base factors (°F per hour for a 100-gallon pool) based on sun exposure
    // These represent the base warming potential that will be adjusted for specific conditions
    const WARMING_FACTORS = {
        full: 0.35,      // Full sun (6+ hours direct sunlight)
        partial: 0.2,    // Partial sun (3-6 hours direct sunlight)
        minimal: 0.1,    // Minimal sun (1-3 hours direct sunlight)
        shade: 0.05      // Shade (no direct sunlight)
    };
    
    // Form elements
    const form = document.getElementById('temperatureCalculatorForm');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'assertive');
    form.prepend(errorContainer);
    
    // Get DOM elements
    const calculateButton = document.getElementById('calculateButton');
    const resultsDiv = document.getElementById('results');
    
    // Results elements
    const warmingTimeResult = document.getElementById('warmingTimeResult');
    const tempRateResult = document.getElementById('tempRateResult');
    const readyTimeResult = document.getElementById('readyTimeResult');
    const idealTempResult = document.getElementById('idealTempResult');
    
    // Input elements cache for validation
    const inputElements = {
        currentTemp: document.getElementById('currentTemp'),
        currentTempUnit: document.getElementById('currentTempUnit'),
        targetTemp: document.getElementById('targetTemp'),
        targetTempUnit: document.getElementById('targetTempUnit'),
        airTemp: document.getElementById('airTemp'),
        airTempUnit: document.getElementById('airTempUnit'),
        sunExposure: document.getElementById('sunExposure'),
        poolVolume: document.getElementById('poolVolume'),
        volumeUnit: document.getElementById('volumeUnit')
    };
    
    // Add event listeners
    calculateButton.addEventListener('click', validateAndCalculate);
    
    // Add input validation listeners to all numeric inputs
    addValidationListeners();
    
    /**
     * Adds validation listeners to all numeric input fields
     * Uses iteration for better scalability with many inputs
     */
    function addValidationListeners() {
        const listener = function() { validateInput(this); };
        
        // Add listeners to all numeric inputs
        for (const key in inputElements) {
            const element = inputElements[key];
            if (element && element.tagName === 'INPUT' && element.type === 'number') {
                element.addEventListener('input', listener);
            }
        }
    }
    
    /**
     * Validates a numeric input field
     * @param {HTMLInputElement} inputElement - The input element to validate
     * @returns {boolean} - Whether the input is valid
     */
    function validateInput(inputElement) {
        const value = parseFloat(inputElement.value);
        let isValid = true;
        
        // Check if value is a number and positive
        if (isNaN(value) || value <= 0) {
            isValid = false;
        }
        
        // Additional validation for temperature inputs
        if (inputElement.id === 'currentTemp' || inputElement.id === 'targetTemp' || inputElement.id === 'airTemp') {
            const unit = document.getElementById(inputElement.id + 'Unit').value;
            const minTemp = unit === 'celsius' ? 0 : 32;  // 0°C or 32°F
            const maxTemp = unit === 'celsius' ? 45 : 113; // 45°C or 113°F
            
            if (value < minTemp || value > maxTemp) {
                isValid = false;
            }
        }
        
        // Update UI based on validation
        if (!isValid) {
            inputElement.classList.add('invalid-input');
            inputElement.setAttribute('aria-invalid', 'true');
        } else {
            inputElement.classList.remove('invalid-input');
            inputElement.setAttribute('aria-invalid', 'false');
        }
        
        return isValid;
    }
    
    /**
     * Validates inputs and then calculates warming time if valid
     */
    function validateAndCalculate() {
        // Hide any previous error messages
        hideErrorMessage();
        
        // Hide previous results
        resultsDiv.classList.remove('active');
        
        let isValid = true;
        
        // Validate current temperature
        if (!validateInput(inputElements.currentTemp)) {
            isValid = false;
            showErrorMessage('Please enter a valid current water temperature.');
            inputElements.currentTemp.focus();
            return;
        }
        
        // Validate target temperature
        if (!validateInput(inputElements.targetTemp)) {
            isValid = false;
            showErrorMessage('Please enter a valid target water temperature.');
            inputElements.targetTemp.focus();
            return;
        }
        
        // Validate air temperature
        if (!validateInput(inputElements.airTemp)) {
            isValid = false;
            showErrorMessage('Please enter a valid air temperature.');
            inputElements.airTemp.focus();
            return;
        }
        
        // Validate pool volume
        if (!validateInput(inputElements.poolVolume)) {
            isValid = false;
            showErrorMessage('Please enter a valid pool volume.');
            inputElements.poolVolume.focus();
            return;
        }
        
        // Check if target temp is higher than current temp
        const currentTemp = getTemperatureInFahrenheit(inputElements.currentTemp, inputElements.currentTempUnit);
        const targetTemp = getTemperatureInFahrenheit(inputElements.targetTemp, inputElements.targetTempUnit);
        
        if (targetTemp <= currentTemp) {
            isValid = false;
            showErrorMessage('Target temperature must be higher than current temperature.');
            inputElements.targetTemp.focus();
            return;
        }
        
        // If all inputs are valid, calculate the warming time
        if (isValid) {
            calculateWarmingTime();
        }
    }
    
    /**
     * Shows an error message
     * @param {string} message - The error message to display
     */
    function showErrorMessage(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        // ARIA attributes already set on container creation
    }
    
    /**
     * Hides the error message
     */
    function hideErrorMessage() {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }
    
    /**
     * Calculates the estimated time for the pool to warm up
     */
    function calculateWarmingTime() {
        // Get input values
        const currentTemp = getTemperatureInFahrenheit(inputElements.currentTemp, inputElements.currentTempUnit);
        const targetTemp = getTemperatureInFahrenheit(inputElements.targetTemp, inputElements.targetTempUnit);
        const airTemp = getTemperatureInFahrenheit(inputElements.airTemp, inputElements.airTempUnit);
        const sunExposure = inputElements.sunExposure.value;
        const poolVolume = getVolumeInGallons(inputElements.poolVolume, inputElements.volumeUnit);
        
        // Calculate temperature difference
        const tempDifference = targetTemp - currentTemp;
        
        // Step 1: Get base warming factor based on sun exposure level
        // This represents the base heating potential for a standard 100-gallon pool
        let warmingFactor = WARMING_FACTORS[sunExposure];
        
        // Step 2: Adjust warming factor based on air temperature
        // Higher air temp accelerates warming, lower air temp slows it down
        // The formula creates a multiplier between MIN_AIR_TEMP_FACTOR and MAX_AIR_TEMP_FACTOR
        // When air temp equals BASE_AIR_TEMP_F, the multiplier is 1.0 (no adjustment)
        const airTempFactor = Math.max(MIN_AIR_TEMP_FACTOR, 
                               Math.min(MAX_AIR_TEMP_FACTOR, 
                                        (airTemp - BASE_AIR_TEMP_F) / AIR_TEMP_SENSITIVITY + 1));
        warmingFactor *= airTempFactor;
        
        // Step 3: Adjust for pool volume (smaller pools warm faster per unit volume)
        // The formula creates a multiplier between MIN_VOLUME_FACTOR and MAX_VOLUME_FACTOR
        // When pool volume equals BASE_VOLUME_GALLONS, the multiplier is 1.0 (no adjustment)
        const volumeFactor = Math.max(MIN_VOLUME_FACTOR, 
                              Math.min(MAX_VOLUME_FACTOR, 
                                       BASE_VOLUME_GALLONS / poolVolume));
        
        // Step 4: Calculate final warming rate in °F per hour for the entire pool
        // This represents how quickly the entire pool will warm up in degrees per hour
        const warmingRate = warmingFactor * volumeFactor;
        
        // Calculate estimated warming time in hours
        const warmingTimeHours = tempDifference / warmingRate;
        
        // Calculate ready time
        const now = new Date();
        const readyTime = new Date(now.getTime() + warmingTimeHours * 60 * 60 * 1000);
        const readyTimeString = readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format warming time
        let formattedTime;
        if (warmingTimeHours < 1) {
            const minutes = Math.round(warmingTimeHours * 60);
            formattedTime = `${minutes} minutes`;
        } else if (warmingTimeHours < 2) {
            const hours = Math.floor(warmingTimeHours);
            const minutes = Math.round((warmingTimeHours - hours) * 60);
            formattedTime = `${hours} hour ${minutes} minutes`;
        } else {
            const hours = Math.round(warmingTimeHours * 10) / 10;
            formattedTime = `${hours} hours`;
        }
        
        // Format warming rate with unit clarification
        const formattedRate = `${warmingRate.toFixed(1)} °F per hour (for the entire pool)`;
        
        // Display results
        warmingTimeResult.textContent = formattedTime;
        tempRateResult.textContent = formattedRate;
        readyTimeResult.textContent = readyTimeString;
        
        // Show ideal temperature range based on user's preferred unit
        const preferredUnit = inputElements.targetTempUnit.value;
        if (preferredUnit === 'celsius') {
            idealTempResult.textContent = '29-31°C';
        } else {
            idealTempResult.textContent = '84-88°F';
        }
        
        // Show results
        resultsDiv.classList.add('active');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Converts a temperature to Fahrenheit
     * @param {HTMLInputElement} tempElement - The input element containing the temperature
     * @param {HTMLSelectElement} unitElement - The select element containing the unit
     * @returns {number} - The temperature in Fahrenheit
     */
    function getTemperatureInFahrenheit(tempElement, unitElement) {
        const temp = parseFloat(tempElement.value);
        const unit = unitElement.value;
        
        if (unit === 'celsius') {
            return CELSIUS_TO_FAHRENHEIT(temp);
        } else {
            return temp;
        }
    }
    
    /**
     * Converts a volume to gallons
     * @param {HTMLInputElement} volumeElement - The input element containing the volume
     * @param {HTMLSelectElement} unitElement - The select element containing the unit
     * @returns {number} - The volume in gallons
     */
    function getVolumeInGallons(volumeElement, unitElement) {
        const volume = parseFloat(volumeElement.value);
        const unit = unitElement.value;
        
        if (unit === 'liters') {
            return volume * LITERS_TO_GALLONS;
        } else {
            return volume;
        }
    }
});
