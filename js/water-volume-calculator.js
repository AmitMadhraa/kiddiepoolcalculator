/**
 * Kiddie Pool Water Volume Calculator
 * 
 * This script handles the functionality for calculating the water volume
 * of different shaped kiddie pools based on user input dimensions.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants for calculations and conversions
    const GALLONS_PER_CUBIC_FOOT = 7.48052;
    const LITERS_PER_GALLON = 3.78541;
    const AVG_HOSE_GPM = 13; // Average garden hose flow in Gallons Per Minute
    const AVG_WATER_COST_PER_GALLON = 0.004; // Average US water rate in dollars
    const INCHES_PER_FOOT = 12;
    const FEET_PER_METER = 3.28084;
    const FEET_PER_CM = 0.0328084;
    
    // Form elements
    const form = document.getElementById('volumeCalculatorForm');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'assertive');
    form.prepend(errorContainer);
    
    // Get DOM elements
    const poolShapeSelect = document.getElementById('poolShape');
    const circularFields = document.getElementById('circularFields');
    const rectangularFields = document.getElementById('rectangularFields');
    const ovalFields = document.getElementById('ovalFields');
    const calculateButton = document.getElementById('calculateButton');
    const resultsDiv = document.getElementById('results');
    
    // Results elements
    const gallonsResult = document.getElementById('gallonsResult');
    const litersResult = document.getElementById('litersResult');
    const cubicFeetResult = document.getElementById('cubicFeetResult');
    const fillTimeResult = document.getElementById('fillTimeResult');
    const costResult = document.getElementById('costResult');
    
    // Input elements cache for validation
    const inputElements = {
        circular: {
            diameter: document.getElementById('diameter'),
            diameterUnit: document.getElementById('diameterUnit')
        },
        rectangular: {
            length: document.getElementById('length'),
            lengthUnit: document.getElementById('lengthUnit'),
            width: document.getElementById('width'),
            widthUnit: document.getElementById('widthUnit')
        },
        oval: {
            length: document.getElementById('ovalLength'),
            lengthUnit: document.getElementById('ovalLengthUnit'),
            width: document.getElementById('ovalWidth'),
            widthUnit: document.getElementById('ovalWidthUnit')
        },
        common: {
            depth: document.getElementById('depth'),
            depthUnit: document.getElementById('depthUnit')
        }
    };
    
    // Add event listeners
    poolShapeSelect.addEventListener('change', toggleFieldsBasedOnShape);
    calculateButton.addEventListener('click', validateAndCalculate);
    
    // Add input validation listeners to all numeric inputs
    addValidationListeners();
    
    // Initialize the form
    toggleFieldsBasedOnShape();
    
    /**
     * Adds validation listeners to all numeric input fields
     * Uses iteration for better scalability with many inputs
     */
    function addValidationListeners() {
        const listener = function() { validateInput(this); };
        
        // Iterate through all input elements and add listeners to number inputs
        for (const shapeType in inputElements) { // 'circular', 'rectangular', 'oval', 'common'
            for (const inputKey in inputElements[shapeType]) { // 'diameter', 'length', 'depth', etc.
                const element = inputElements[shapeType][inputKey];
                // Ensure it's an actual input element we want to validate
                if (element && element.tagName === 'INPUT' && element.type === 'number') {
                    element.addEventListener('input', listener);
                }
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
        
        if (isNaN(value) || value <= 0) {
            inputElement.classList.add('invalid-input');
            inputElement.setAttribute('aria-invalid', 'true');
            return false;
        } else {
            inputElement.classList.remove('invalid-input');
            inputElement.setAttribute('aria-invalid', 'false');
            return true;
        }
    }
    
    /**
     * Shows/hides the appropriate input fields based on the selected pool shape
     * Uses CSS classes instead of direct style manipulation
     */
    function toggleFieldsBasedOnShape() {
        const selectedShape = poolShapeSelect.value;
        
        // Helper to clear validation from a group of fields
        const clearValidationFromGroup = (fieldsGroup) => {
            for (const key in fieldsGroup) {
                const element = fieldsGroup[key];
                if (element && element.tagName === 'INPUT' && element.type === 'number') {
                    element.classList.remove('invalid-input');
                    element.setAttribute('aria-invalid', 'false');
                }
            }
        };
        
        // Hide all shape-specific fields first and clear validation
        circularFields.classList.add('hidden');
        clearValidationFromGroup(inputElements.circular);
        
        rectangularFields.classList.add('hidden');
        clearValidationFromGroup(inputElements.rectangular);
        
        ovalFields.classList.add('hidden');
        clearValidationFromGroup(inputElements.oval);
        
        // Show the fields for the selected shape
        if (selectedShape === 'circular') {
            circularFields.classList.remove('hidden');
        } else if (selectedShape === 'rectangular') {
            rectangularFields.classList.remove('hidden');
        } else if (selectedShape === 'oval') {
            ovalFields.classList.remove('hidden');
        }
        
        // Clear any previous error messages
        hideErrorMessage();
    }
    
    /**
     * Validates inputs and then calculates volume if valid
     */
    function validateAndCalculate() {
        // Hide any previous error messages
        hideErrorMessage();
        
        // Hide previous results
        resultsDiv.classList.remove('active');
        
        const selectedShape = poolShapeSelect.value;
        let isValid = true;
        
        // Validate depth (common to all shapes)
        const depthElement = inputElements.common.depth;
        const depthValid = validateInput(depthElement);
        if (!depthValid) {
            isValid = false;
            showErrorMessage('Please enter a valid, positive depth.');
            depthElement.focus();
            return;
        }
        
        // Validate shape-specific dimensions
        if (selectedShape === 'circular') {
            const diameterElement = inputElements.circular.diameter;
            const diameterValid = validateInput(diameterElement);
            if (!diameterValid) {
                isValid = false;
                showErrorMessage('Please enter a valid, positive diameter.');
                diameterElement.focus();
                return;
            }
        } 
        else if (selectedShape === 'rectangular') {
            const lengthElement = inputElements.rectangular.length;
            const widthElement = inputElements.rectangular.width;
            
            const lengthValid = validateInput(lengthElement);
            const widthValid = validateInput(widthElement);
            
            if (!lengthValid) {
                isValid = false;
                showErrorMessage('Please enter a valid, positive length.');
                lengthElement.focus();
                return;
            }
            
            if (!widthValid) {
                isValid = false;
                showErrorMessage('Please enter a valid, positive width.');
                widthElement.focus();
                return;
            }
        } 
        else if (selectedShape === 'oval') {
            const lengthElement = inputElements.oval.length;
            const widthElement = inputElements.oval.width;
            
            const lengthValid = validateInput(lengthElement);
            const widthValid = validateInput(widthElement);
            
            if (!lengthValid) {
                isValid = false;
                showErrorMessage('Please enter a valid, positive length.');
                lengthElement.focus();
                return;
            }
            
            if (!widthValid) {
                isValid = false;
                showErrorMessage('Please enter a valid, positive width.');
                widthElement.focus();
                return;
            }
        }
        
        // If all inputs are valid, calculate the volume
        if (isValid) {
            calculateVolume();
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
     * Calculates the water volume based on the input values and selected shape
     */
    function calculateVolume() {
        const selectedShape = poolShapeSelect.value;
        let volume = 0; // in cubic feet
        
        // Get the depth value and convert to feet
        const depth = getValueInFeet(inputElements.common.depth, inputElements.common.depthUnit);
        
        if (selectedShape === 'circular') {
            // For circular pools: volume = π × r² × depth
            const diameter = getValueInFeet(inputElements.circular.diameter, inputElements.circular.diameterUnit);
            const radius = diameter / 2;
            volume = Math.PI * Math.pow(radius, 2) * depth;
        } 
        else if (selectedShape === 'rectangular') {
            // For rectangular pools: volume = length × width × depth
            const length = getValueInFeet(inputElements.rectangular.length, inputElements.rectangular.lengthUnit);
            const width = getValueInFeet(inputElements.rectangular.width, inputElements.rectangular.widthUnit);
            volume = length * width * depth;
        } 
        else if (selectedShape === 'oval') {
            // For oval pools: volume = π × (length/2) × (width/2) × depth
            const length = getValueInFeet(inputElements.oval.length, inputElements.oval.lengthUnit);
            const width = getValueInFeet(inputElements.oval.width, inputElements.oval.widthUnit);
            volume = Math.PI * (length / 2) * (width / 2) * depth;
        }
        
        // Convert cubic feet to other units
        const gallons = volume * GALLONS_PER_CUBIC_FOOT;
        const liters = gallons * LITERS_PER_GALLON;
        
        // Calculate fill time (assuming average garden hose flow)
        const fillTimeMinutes = gallons / AVG_HOSE_GPM;
        
        // Calculate water cost (using average US water rate)
        const waterCost = gallons * AVG_WATER_COST_PER_GALLON;
        
        // Display results with context for estimates
        gallonsResult.textContent = `${gallons.toFixed(1)} gallons`;
        litersResult.textContent = `${liters.toFixed(1)} liters`;
        cubicFeetResult.textContent = `${volume.toFixed(1)} cubic feet`;
        fillTimeResult.textContent = `${fillTimeMinutes.toFixed(1)} minutes (based on avg. garden hose flow of ${AVG_HOSE_GPM} GPM)`;
        costResult.textContent = `$${waterCost.toFixed(2)} (based on avg. water rate of $${AVG_WATER_COST_PER_GALLON.toFixed(4)}/gallon)`;
        
        // Show results
        resultsDiv.classList.add('active');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Converts a value from its input unit to feet
     * @param {HTMLInputElement} valueElement - The input element containing the value
     * @param {HTMLSelectElement} unitElement - The select element containing the unit
     * @returns {number} - The value converted to feet
     */
    function getValueInFeet(valueElement, unitElement) {
        const value = parseFloat(valueElement.value);
        const unit = unitElement.value;
        
        switch (unit) {
            case 'inches':
                return value / INCHES_PER_FOOT;
            case 'meters':
                return value * FEET_PER_METER;
            case 'cm':
                return value * FEET_PER_CM;
            case 'feet':
                return value;
            default:
                console.error(`Unknown unit: ${unit}. This may lead to incorrect calculations.`);
                showErrorMessage(`Error: Unknown unit '${unit}'. Please select a valid unit.`);
                return NaN; // Return NaN to indicate an error
        }
    }
});
