/**
 * Kiddie Pool Evaporation Rate Calculator
 * 
 * This script handles the functionality for calculating the estimated
 * water loss due to evaporation in a kiddie pool based on various factors.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants for calculations and conversions
    const INCHES_TO_CM = 2.54;
    const FEET_TO_INCHES = 12;
    const METERS_TO_FEET = 3.28084;
    const CM_TO_INCHES = 0.393701;
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const FAHRENHEIT_TO_CELSIUS = (f) => (f - 32) * (5/9);
    const CELSIUS_TO_FAHRENHEIT = (c) => (c * (9/5)) + 32;
    
    // Constants for evaporation calculations
    const BASE_EVAPORATION_RATE_INCHES_PER_DAY = 0.1;
    const TEMP_DIFFERENCE_FACTOR = 0.01;
    const HUMIDITY_DIVISOR = 200;
    const GALLONS_PER_SQ_FOOT_INCH = 0.623;
    const CHART_BAR_SCALING_FACTOR = 25;
    const TOP_UP_THRESHOLD_INCHES = 1;

    // Temperature validation ranges
    const TEMP_RANGES = {
        celsius: { min: 0, max: 50 },
        fahrenheit: { min: 32, max: 120 }
    };

    // Environmental factors for evaporation
    const SUN_FACTORS = {
        'full': 1.5,     // Full sun (6+ hours direct sunlight)
        'partial': 1.2,  // Partial sun (3-6 hours direct sunlight)
        'minimal': 1,    // Minimal sun (1-3 hours direct sunlight)
        'shade': 0.7     // Shade (No direct sunlight)
    };

    const WIND_FACTORS = {
        'calm': 1,       // Calm (0-5 mph / 0-8 km/h)
        'light': 1.3,    // Light Breeze (5-10 mph / 8-16 km/h)
        'moderate': 1.6, // Moderate Wind (10-20 mph / 16-32 km/h)
        'strong': 2      // Strong Wind (20+ mph / 32+ km/h)
    };
    
    // Cache all DOM elements
    const elements = {
        // Form container and error display
        form: document.getElementById('evaporationCalculatorForm'),
        calculateButton: document.getElementById('calculateButton'),
        
        // Pool shape selection
        poolShape: document.getElementById('poolShape'),
        
        // Field containers
        fieldContainers: {
            circular: document.getElementById('circularFields'),
            rectangular: document.getElementById('rectangularFields'),
            oval: document.getElementById('ovalFields')
        },
        
        // Circular pool inputs
        circular: {
            diameter: document.getElementById('diameter'),
            diameterUnit: document.getElementById('diameterUnit')
        },
        
        // Rectangular pool inputs
        rectangular: {
            length: document.getElementById('length'),
            lengthUnit: document.getElementById('lengthUnit'),
            width: document.getElementById('width'),
            widthUnit: document.getElementById('widthUnit')
        },
        
        // Oval pool inputs
        oval: {
            length: document.getElementById('ovalLength'),
            lengthUnit: document.getElementById('ovalLengthUnit'),
            width: document.getElementById('ovalWidth'),
            widthUnit: document.getElementById('ovalWidthUnit')
        },
        
        // Environmental inputs
        environmental: {
            waterTemp: document.getElementById('waterTemp'),
            waterTempUnit: document.getElementById('waterTempUnit'),
            airTemp: document.getElementById('airTemp'),
            airTempUnit: document.getElementById('airTempUnit'),
            humidity: document.getElementById('humidity'),
            sunExposure: document.getElementById('sunExposure'),
            windCondition: document.getElementById('windCondition')
        },
        
        // Results elements
        results: {
            container: document.getElementById('results'),
            dailyLoss: document.getElementById('dailyLossResult'),
            weeklyLoss: document.getElementById('weeklyLossResult'),
            levelDrop: document.getElementById('levelDropResult'),
            topupFrequency: document.getElementById('topupFrequencyResult'),
            chartContainer: document.getElementById('chartContainer')
        }
    };
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'assertive');
    elements.form.prepend(errorContainer);
    
    // Add event listeners
    elements.poolShape.addEventListener('change', togglePoolFields);
    elements.calculateButton.addEventListener('click', validateAndCalculate);
    
    // Add validation listeners to all inputs
    addValidationListeners();
    
    // Initialize the form
    togglePoolFields();
    
    /**
     * Adds validation listeners to all numeric input fields
     */
    function addValidationListeners() {
        // Add listeners to circular pool inputs
        elements.circular.diameter.addEventListener('input', function() {
            validateDimension(this);
        });
        
        // Add listeners to rectangular pool inputs
        elements.rectangular.length.addEventListener('input', function() {
            validateDimension(this);
        });
        elements.rectangular.width.addEventListener('input', function() {
            validateDimension(this);
        });
        
        // Add listeners to oval pool inputs
        elements.oval.length.addEventListener('input', function() {
            validateDimension(this);
        });
        elements.oval.width.addEventListener('input', function() {
            validateDimension(this);
        });
        
        // Add listeners to temperature inputs
        elements.environmental.waterTemp.addEventListener('input', function() {
            validateTemperature(this, elements.environmental.waterTempUnit);
        });
        elements.environmental.airTemp.addEventListener('input', function() {
            validateTemperature(this, elements.environmental.airTempUnit);
        });
        
        // Add listener to humidity input
        elements.environmental.humidity.addEventListener('input', function() {
            validateHumidity(this);
        });
        
        // Add listeners to unit selectors that affect validation
        elements.environmental.waterTempUnit.addEventListener('change', function() {
            validateTemperature(elements.environmental.waterTemp, this);
        });
        elements.environmental.airTempUnit.addEventListener('change', function() {
            validateTemperature(elements.environmental.airTemp, this);
        });
    }
    
    /**
     * Toggles the visibility of pool dimension fields based on selected shape
     */
    function togglePoolFields() {
        const selectedShape = elements.poolShape.value;
        
        // Hide all fields first
        elements.fieldContainers.circular.classList.add('hidden');
        elements.fieldContainers.rectangular.classList.add('hidden');
        elements.fieldContainers.oval.classList.add('hidden');
        
        // Show the appropriate fields based on selection
        if (selectedShape === 'circular') {
            elements.fieldContainers.circular.classList.remove('hidden');
        } else if (selectedShape === 'rectangular') {
            elements.fieldContainers.rectangular.classList.remove('hidden');
        } else if (selectedShape === 'oval') {
            elements.fieldContainers.oval.classList.remove('hidden');
        }
    }
    
    /**
     * Validates inputs and then calculates evaporation rate if valid
     */
    function validateAndCalculate() {
        // Hide any previous error messages
        hideErrorMessage();
        
        // Hide previous results
        elements.results.container.classList.remove('active');
        
        let isValid = true;
        
        // Validate based on pool shape
        const poolShape = elements.poolShape.value;
        
        if (poolShape === 'circular') {
            if (!validateDimension(elements.circular.diameter)) {
                isValid = false;
                showErrorMessage('Please enter a valid diameter greater than zero.');
                elements.circular.diameter.focus();
                return;
            }
        } else if (poolShape === 'rectangular') {
            if (!validateDimension(elements.rectangular.length)) {
                isValid = false;
                showErrorMessage('Please enter a valid length greater than zero.');
                elements.rectangular.length.focus();
                return;
            }
            
            if (!validateDimension(elements.rectangular.width)) {
                isValid = false;
                showErrorMessage('Please enter a valid width greater than zero.');
                elements.rectangular.width.focus();
                return;
            }
        } else if (poolShape === 'oval') {
            if (!validateDimension(elements.oval.length)) {
                isValid = false;
                showErrorMessage('Please enter a valid oval length greater than zero.');
                elements.oval.length.focus();
                return;
            }
            
            if (!validateDimension(elements.oval.width)) {
                isValid = false;
                showErrorMessage('Please enter a valid oval width greater than zero.');
                elements.oval.width.focus();
                return;
            }
        }
        
        // Validate environmental conditions
        if (!validateTemperature(elements.environmental.waterTemp, elements.environmental.waterTempUnit)) {
            isValid = false;
            showErrorMessage('Please enter a valid water temperature.');
            elements.environmental.waterTemp.focus();
            return;
        }
        
        if (!validateTemperature(elements.environmental.airTemp, elements.environmental.airTempUnit)) {
            isValid = false;
            showErrorMessage('Please enter a valid air temperature.');
            elements.environmental.airTemp.focus();
            return;
        }
        
        if (!validateHumidity(elements.environmental.humidity)) {
            isValid = false;
            showErrorMessage('Please enter a valid humidity percentage (0-100%).');
            elements.environmental.humidity.focus();
            return;
        }
        
        // If all inputs are valid, calculate the evaporation rate
        if (isValid) {
            calculateEvaporationRate();
        }
    }
    
    /**
     * Validates a dimension input
     * @param {HTMLInputElement} input - The dimension input element
     * @returns {boolean} - Whether the input is valid
     */
    function validateDimension(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value > 0;
        
        if (isValid) {
            input.classList.remove('invalid-input');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('invalid-input');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    /**
     * Validates a temperature input
     * @param {HTMLInputElement} input - The temperature input element
     * @param {HTMLSelectElement} unitSelect - The select element containing the unit
     * @returns {boolean} - Whether the input is valid
     */
    function validateTemperature(input, unitSelect) {
        const value = parseFloat(input.value);
        const unit = unitSelect.value;
        
        let isValid = !isNaN(value);
        
        if (isValid) {
            // Check temperature ranges based on unit
            if (unit === 'celsius') {
                isValid = value >= TEMP_RANGES.celsius.min && value <= TEMP_RANGES.celsius.max;
            } else {
                isValid = value >= TEMP_RANGES.fahrenheit.min && value <= TEMP_RANGES.fahrenheit.max;
            }
        }
        
        if (isValid) {
            input.classList.remove('invalid-input');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('invalid-input');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    /**
     * Validates a humidity input
     * @param {HTMLInputElement} input - The humidity input element
     * @returns {boolean} - Whether the input is valid
     */
    function validateHumidity(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value >= 0 && value <= 100;
        
        if (isValid) {
            input.classList.remove('invalid-input');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('invalid-input');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    /**
     * Shows an error message
     * @param {string} message - The error message to display
     */
    function showErrorMessage(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    /**
     * Hides the error message
     */
    function hideErrorMessage() {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }
    
    /**
     * Calculates the surface area of the pool in square feet
     * @returns {number} - The surface area in square feet
     */
    function calculateSurfaceArea() {
        const poolShape = elements.poolShape.value;
        let surfaceArea = 0;
        
        if (poolShape === 'circular') {
            const diameter = parseFloat(elements.circular.diameter.value);
            const unit = elements.circular.diameterUnit.value;
            const diameterInFeet = convertToFeet(diameter, unit);
            const radius = diameterInFeet / 2;
            surfaceArea = Math.PI * radius * radius;
        } else if (poolShape === 'rectangular') {
            const length = parseFloat(elements.rectangular.length.value);
            const lengthUnit = elements.rectangular.lengthUnit.value;
            const width = parseFloat(elements.rectangular.width.value);
            const widthUnit = elements.rectangular.widthUnit.value;
            
            const lengthInFeet = convertToFeet(length, lengthUnit);
            const widthInFeet = convertToFeet(width, widthUnit);
            
            surfaceArea = lengthInFeet * widthInFeet;
        } else if (poolShape === 'oval') {
            const ovalLength = parseFloat(elements.oval.length.value);
            const ovalLengthUnit = elements.oval.lengthUnit.value;
            const ovalWidth = parseFloat(elements.oval.width.value);
            const ovalWidthUnit = elements.oval.widthUnit.value;
            
            const lengthInFeet = convertToFeet(ovalLength, ovalLengthUnit);
            const widthInFeet = convertToFeet(ovalWidth, ovalWidthUnit);
            
            // Oval area approximation: π × (length/2) × (width/2)
            surfaceArea = Math.PI * (lengthInFeet / 2) * (widthInFeet / 2);
        }
        
        return surfaceArea;
    }
    
    /**
     * Converts a measurement to feet based on the unit
     * @param {number} value - The measurement value
     * @param {string} unit - The unit of measurement
     * @returns {number} - The measurement in feet or NaN if unit is unknown
     */
    function convertToFeet(value, unit) {
        switch (unit) {
            case 'inches':
                return value / FEET_TO_INCHES;
            case 'feet':
                return value;
            case 'meters':
                return value * METERS_TO_FEET;
            case 'cm':
                return value * 0.0328084; // Using FEET_PER_CM for clarity
            default:
                console.error(`Unknown unit: ${unit}`);
                showErrorMessage(`Error: Unknown unit '${unit}'. Please select a valid unit.`);
                return NaN;
        }
    }
    
    /**
     * Calculates the evaporation rate and updates the results
     */
    function calculateEvaporationRate() {
        // Get surface area in square feet
        const surfaceArea = calculateSurfaceArea();
        
        // Get environmental factors
        const waterTemp = parseFloat(elements.environmental.waterTemp.value);
        const waterTempUnit = elements.environmental.waterTempUnit.value;
        const airTemp = parseFloat(elements.environmental.airTemp.value);
        const airTempUnit = elements.environmental.airTempUnit.value;
        const humidity = parseFloat(elements.environmental.humidity.value);
        const sunExposure = elements.environmental.sunExposure.value;
        const windCondition = elements.environmental.windCondition.value;
        
        // Convert temperatures to Fahrenheit for calculations
        const waterTempF = waterTempUnit === 'celsius' ? CELSIUS_TO_FAHRENHEIT(waterTemp) : waterTemp;
        const airTempF = airTempUnit === 'celsius' ? CELSIUS_TO_FAHRENHEIT(airTemp) : airTemp;
        
        // Base evaporation rate in inches per day
        let evaporationRate = BASE_EVAPORATION_RATE_INCHES_PER_DAY;
        
        // Adjust for temperature difference (water vs air)
        // Higher difference increases evaporation
        const tempDifference = Math.max(0, waterTempF - airTempF);
        const tempFactor = 1 + (tempDifference * TEMP_DIFFERENCE_FACTOR);
        evaporationRate *= tempFactor;
        
        // Adjust for humidity
        // Lower humidity increases evaporation
        const humidityFactor = 1 - (humidity / HUMIDITY_DIVISOR);
        evaporationRate *= humidityFactor;
        
        // Adjust for sun exposure
        evaporationRate *= SUN_FACTORS[sunExposure];
        
        // Adjust for wind conditions
        evaporationRate *= WIND_FACTORS[windCondition];
        
        // Calculate daily water loss in gallons
        const dailyLossGallons = evaporationRate * surfaceArea * GALLONS_PER_SQ_FOOT_INCH;
        
        // Calculate weekly water loss
        const weeklyLossGallons = dailyLossGallons * 7;
        
        // Calculate water level drop in inches per day
        const waterLevelDrop = evaporationRate;
        
        // Calculate recommended top-up frequency
        // Top up when water level drops by TOP_UP_THRESHOLD_INCHES
        const topupFrequency = Math.max(1, Math.round(TOP_UP_THRESHOLD_INCHES / waterLevelDrop));
        
        // Update results
        elements.results.dailyLoss.textContent = `${dailyLossGallons.toFixed(2)} gallons (${(dailyLossGallons * GALLONS_TO_LITERS).toFixed(2)} liters)`;
        elements.results.weeklyLoss.textContent = `${weeklyLossGallons.toFixed(2)} gallons (${(weeklyLossGallons * GALLONS_TO_LITERS).toFixed(2)} liters)`;
        elements.results.levelDrop.textContent = `${waterLevelDrop.toFixed(2)} inches (${(waterLevelDrop * INCHES_TO_CM).toFixed(2)} cm) per day`;
        elements.results.topupFrequency.textContent = `Every ${topupFrequency} day${topupFrequency !== 1 ? 's' : ''}`;
        
        // Update chart
        updateEvaporationChart(waterLevelDrop);
        
        // Show results
        elements.results.container.classList.add('active');
        elements.results.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Updates the evaporation chart with daily water level drops
     * @param {number} dailyDrop - The daily water level drop in inches
     */
    function updateEvaporationChart(dailyDrop) {
        // Clear previous chart
        elements.results.chartContainer.innerHTML = '';
        
        // Create 5-day projection
        for (let day = 1; day <= 5; day++) {
            const cumulativeDrop = dailyDrop * day;
            const percentHeight = Math.min(100, cumulativeDrop * CHART_BAR_SCALING_FACTOR);
            
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar-container';
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = `Day ${day}`;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${percentHeight}%`;
            bar.setAttribute('title', `${cumulativeDrop.toFixed(2)} inches`);
            
            barContainer.appendChild(label);
            barContainer.appendChild(bar);
            elements.results.chartContainer.appendChild(barContainer);
        }
    }
});