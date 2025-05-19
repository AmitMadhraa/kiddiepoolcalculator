/**
 * Kiddie Pool Chemical Treatment Calculator
 * 
 * This script handles the functionality for calculating the appropriate
 * amount of chemicals needed for safe water in a kiddie pool.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants for calculations and conversions
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const FAHRENHEIT_TO_CELSIUS = (f) => (f - 32) * (5/9);
    const CELSIUS_TO_FAHRENHEIT = (c) => (c * (9/5)) + 32;
    
    // Temperature constants for adjustments
    const HOT_WATER_THRESHOLD_F = 85;      // Temperature threshold in °F above which more chemicals are needed
    const TEMP_ADJUSTMENT_SENSITIVITY = 50; // Divisor for temperature adjustment calculation
    
    // Temperature validation ranges
    const TEMP_RANGES = {
        celsius: { min: 10, max: 40 },  // 10-40°C
        fahrenheit: { min: 50, max: 104 }  // 50-104°F
    };
    
    // Chemical dosage factors (amount per gallon)
    const CHEMICAL_FACTORS = {
        'chlorine-tablets': {
            unit: 'tablets',
            low: 0.005,     // tablets per gallon for low level
            medium: 0.01,   // tablets per gallon for medium level
            high: 0.015,    // tablets per gallon for high level
            measurementConversion: (tablets) => `${tablets} tablet(s)`,
            frequency: {
                low: 3,     // days between treatments for low level
                medium: 2,  // days between treatments for medium level
                high: 1     // days between treatments for high level
            },
            safety: "Break tablets into smaller pieces for kiddie pools. Wait at least 1 hour after adding before allowing swimming. Test water before use."
        },
        'chlorine-granules': {
            unit: 'ounces',
            low: 0.0015,    // oz per gallon for low level
            medium: 0.003,  // oz per gallon for medium level
            high: 0.005,    // oz per gallon for high level
            measurementConversion: (oz) => {
                if (oz < 0.125) {
                    return `${(oz * 96).toFixed(1)} pinches`;
                } else if (oz < 0.5) {
                    return `${(oz * 6).toFixed(1)} teaspoons`;
                } else {
                    return `${(oz / 2).toFixed(2)} tablespoons`;
                }
            },
            frequency: {
                low: 3,
                medium: 2,
                high: 1
            },
            safety: "Pre-dissolve granules in a bucket of water before adding to pool. Wait at least 30 minutes before swimming. Test water before use."
        },
        'liquid-chlorine': {
            unit: 'ounces',
            low: 0.05,      // oz per gallon for low level
            medium: 0.1,    // oz per gallon for medium level
            high: 0.15,     // oz per gallon for high level
            measurementConversion: (oz) => {
                if (oz < 0.5) {
                    return `${(oz * 6).toFixed(1)} teaspoons`;
                } else if (oz < 8) {
                    return `${(oz / 2).toFixed(1)} tablespoons`;
                } else {
                    return `${(oz / 8).toFixed(2)} cups`;
                }
            },
            frequency: {
                low: 2,
                medium: 1,
                high: 1
            },
            safety: "Use household bleach with 5-6% sodium hypochlorite, unscented. Dilute before adding to pool. Wait at least 30 minutes before swimming. Test water before use."
        },
        'chlorine-free': {
            unit: 'ounces',
            low: 0.1,       // oz per gallon for low level
            medium: 0.15,   // oz per gallon for medium level
            high: 0.2,      // oz per gallon for high level
            measurementConversion: (oz) => {
                if (oz < 0.5) {
                    return `${(oz * 6).toFixed(1)} teaspoons`;
                } else if (oz < 8) {
                    return `${(oz / 2).toFixed(1)} tablespoons`;
                } else {
                    return `${(oz / 8).toFixed(2)} cups`;
                }
            },
            frequency: {
                low: 3,
                medium: 2,
                high: 1
            },
            safety: "Follow product-specific instructions. Most chlorine-free sanitizers are safer for children but may be less effective in very hot weather or with heavy use."
        },
        'hydrogen-peroxide': {
            unit: 'ounces',
            low: 0.5,       // oz per gallon for low level
            medium: 0.75,   // oz per gallon for medium level
            high: 1.0,      // oz per gallon for high level
            measurementConversion: (oz) => {
                if (oz < 8) {
                    return `${(oz / 2).toFixed(1)} tablespoons`;
                } else {
                    return `${(oz / 8).toFixed(2)} cups`;
                }
            },
            frequency: {
                low: 3,
                medium: 2,
                high: 1
            },
            safety: "Use 3% hydrogen peroxide (standard household strength). Safe for children, but less effective than chlorine. May need more frequent application in hot weather."
        }
    };
    
    // Form elements
    const form = document.getElementById('chemicalCalculatorForm');
    // Create error container with accessibility attributes
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
    const amountResult = document.getElementById('amountResult');
    const measurementResult = document.getElementById('measurementResult');
    const frequencyResult = document.getElementById('frequencyResult');
    const safetyResult = document.getElementById('safetyResult');
    
    // Input elements cache for validation
    const inputElements = {
        poolVolume: document.getElementById('poolVolume'),
        volumeUnit: document.getElementById('volumeUnit'),
        chemicalType: document.getElementById('chemicalType'),
        targetLevel: document.getElementById('targetLevel'),
        currentLevel: document.getElementById('currentLevel'),
        waterTemp: document.getElementById('waterTemp'),
        tempUnit: document.getElementById('tempUnit')
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
        if (isNaN(value) || value < 0) {
            isValid = false;
        }
        
        // Additional validation for specific inputs
        if (inputElement.id === 'poolVolume' && value <= 0) {
            isValid = false;
        }
        
        if (inputElement.id === 'currentLevel' && value > 10) {
            isValid = false;
        }
        
        if (inputElement.id === 'waterTemp') {
            const unit = document.getElementById('tempUnit').value;
            const minTemp = TEMP_RANGES[unit].min;
            const maxTemp = TEMP_RANGES[unit].max;
            
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
     * Validates inputs and then calculates chemical amounts if valid
     */
    function validateAndCalculate() {
        // Hide any previous error messages
        hideErrorMessage();
        
        // Hide previous results
        resultsDiv.classList.remove('active');
        
        let isValid = true;
        
        // Validate pool volume
        if (!validateInput(inputElements.poolVolume)) {
            isValid = false;
            showErrorMessage('Please enter a valid pool volume greater than zero.');
            inputElements.poolVolume.focus();
            return;
        }
        
        // Validate current chlorine level
        if (!validateInput(inputElements.currentLevel)) {
            isValid = false;
            showErrorMessage('Please enter a valid current chlorine level (0-10 ppm).');
            inputElements.currentLevel.focus();
            return;
        }
        
        // Validate water temperature
        if (!validateInput(inputElements.waterTemp)) {
            isValid = false;
            showErrorMessage('Please enter a valid water temperature.');
            inputElements.waterTemp.focus();
            return;
        }
        
        // If all inputs are valid, calculate the chemical amount
        if (isValid) {
            calculateChemicalAmount();
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
     * Calculates the appropriate amount of chemicals needed
     */
    function calculateChemicalAmount() {
        // Get input values
        const poolVolume = getVolumeInGallons(inputElements.poolVolume, inputElements.volumeUnit);
        const chemicalType = inputElements.chemicalType.value;
        const targetLevel = inputElements.targetLevel.value;
        const currentLevel = parseFloat(inputElements.currentLevel.value) || 0;
        const waterTemp = getTemperatureInFahrenheit(inputElements.waterTemp, inputElements.tempUnit);
        
        // Get chemical factor based on type and target level
        const chemicalFactor = CHEMICAL_FACTORS[chemicalType][targetLevel];
        
        // Calculate base amount
        let amount = poolVolume * chemicalFactor;
        
        // Adjust for current chlorine level if applicable
        if (currentLevel > 0 && chemicalType.includes('chlorine')) {
            // Calculate target ppm based on level
            let targetPPM;
            if (targetLevel === 'low') {
                targetPPM = 1.5; // 1-2 ppm average
            } else if (targetLevel === 'medium') {
                targetPPM = 2.5; // 2-3 ppm average
            } else {
                targetPPM = 3.5; // 3-4 ppm average
            }
            
            // Adjust amount based on difference between current and target ppm
            if (currentLevel < targetPPM) {
                const adjustment = (targetPPM - currentLevel) / targetPPM;
                amount *= adjustment;
            } else {
                // If current level is already at or above target, no chemicals needed
                amount = 0;
            }
        }
        
        // Adjust for water temperature
        // Higher temperatures need more chemicals due to faster degradation
        if (waterTemp > HOT_WATER_THRESHOLD_F) {
            // Calculate temperature adjustment factor - increases chemical amount by up to 30% for very hot water
            const tempFactor = 1 + ((waterTemp - HOT_WATER_THRESHOLD_F) / TEMP_ADJUSTMENT_SENSITIVITY);
            amount *= tempFactor;
        }
        
        // Get unit and format amount
        const unit = CHEMICAL_FACTORS[chemicalType].unit;
        const formattedAmount = `${amount.toFixed(2)} ${unit}`;
        
        // Get measurement equivalent
        const measurementEquivalent = CHEMICAL_FACTORS[chemicalType].measurementConversion(amount);
        
        // Get treatment frequency
        const frequency = CHEMICAL_FACTORS[chemicalType].frequency[targetLevel];
        const formattedFrequency = `Every ${frequency} day${frequency > 1 ? 's' : ''}`;
        
        // Get safety notes
        const safetyNotes = CHEMICAL_FACTORS[chemicalType].safety;
        
        // Display results
        amountResult.textContent = formattedAmount;
        measurementResult.textContent = measurementEquivalent;
        frequencyResult.textContent = formattedFrequency;
        safetyResult.textContent = safetyNotes;
        
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
