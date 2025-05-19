/**
 * Drainage Time Calculator for Kiddie Pools
 * * This script calculates the estimated time to drain a kiddie pool
 * based on pool volume and drainage method.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        // Form elements
        form: document.getElementById('drainageCalculatorForm'),
        errorContainer: document.getElementById('errorContainer'),
        calculationMethod: document.getElementById('calculationMethod'),
        
        // Initialize accessibility attributes for errorContainer
        init: function() {
            if (this.errorContainer) {
                this.errorContainer.setAttribute('role', 'alert');
                this.errorContainer.setAttribute('aria-live', 'assertive');
            }
            return this;
        },
        
        // Volume section elements
        volumeSection: document.getElementById('volumeSection'),
        waterVolume: document.getElementById('waterVolume'),
        volumeUnit: document.getElementById('volumeUnit'),
        
        // Dimensions section elements
        dimensionsSection: document.getElementById('dimensionsSection'),
        poolShape: document.getElementById('poolShape'),
        roundDimensions: document.getElementById('roundDimensions'),
        rectangularDimensions: document.getElementById('rectangularDimensions'),
        ovalDimensions: document.getElementById('ovalDimensions'),
        
        // Round pool dimensions
        diameter: document.getElementById('diameter'),
        diameterUnit: document.getElementById('diameterUnit'),
        
        // Rectangular pool dimensions
        length: document.getElementById('length'),
        lengthUnit: document.getElementById('lengthUnit'),
        width: document.getElementById('width'),
        widthUnit: document.getElementById('widthUnit'),
        
        // Oval pool dimensions
        longDiameter: document.getElementById('longDiameter'),
        longDiameterUnit: document.getElementById('longDiameterUnit'),
        shortDiameter: document.getElementById('shortDiameter'),
        shortDiameterUnit: document.getElementById('shortDiameterUnit'),
        
        // Common dimensions
        depth: document.getElementById('depth'),
        depthUnit: document.getElementById('depthUnit'),
        
        // Drainage method elements
        drainageMethod: document.getElementById('drainageMethod'),
        siphonOptions: document.getElementById('siphonOptions'),
        pumpOptions: document.getElementById('pumpOptions'),
        drainOptions: document.getElementById('drainOptions'),
        manualOptions: document.getElementById('manualOptions'),
        
        // Siphon options
        hoseSize: document.getElementById('hoseSize'),
        heightDifference: document.getElementById('heightDifference'),
        heightUnit: document.getElementById('heightUnit'),
        
        // Pump options
        pumpFlow: document.getElementById('pumpFlow'),
        flowUnit: document.getElementById('flowUnit'),
        
        // Drain options
        drainSize: document.getElementById('drainSize'),
        
        // Manual options
        helpers: document.getElementById('helpers'),

        // Water Treatment (for environmental tips) - Ensure this ID exists in your HTML
        waterTreatment: document.getElementById('waterTreatment'), 
        
        // Button
        calculateButton: document.getElementById('calculateButton'),
        
        // Results elements
        results: document.getElementById('results'),
        drainageTimeResult: document.getElementById('drainageTimeResult'),
        detailsResult: document.getElementById('detailsResult'),
        tipsResult: document.getElementById('tipsResult'),
        environmentalResult: document.getElementById('environmentalResult')
    };
    
    // Constants for calculations and conversions
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const FEET_TO_METERS = 0.3048;
    const METERS_TO_FEET = 3.28084;
    const INCHES_TO_FEET = 1/12;
    const CM_TO_METERS = 1/100;
    const PI = Math.PI;
    const GALLONS_PER_CUBIC_FOOT = 7.48052;
    
    // Flow rates for different siphon hose sizes (in gallons per minute)
    // These are approximate values based on a 2-foot height difference
    const SIPHON_FLOW_RATES = {
        '0.5': 3,     // 1/2 inch hose: ~3 GPM
        '0.625': 5,   // 5/8 inch hose: ~5 GPM
        '0.75': 7,    // 3/4 inch hose: ~7 GPM
        '1': 12       // 1 inch hose: ~12 GPM
    };
    
    // Height difference multiplier for siphon flow
    // Flow rate increases with the square root of height difference (relative to a 2ft base for these rates)
    const HEIGHT_DIFFERENCE_MULTIPLIER = (heightInFeet) => {
        if (heightInFeet <= 0) return 0; // No flow if no height difference or negative
        return Math.sqrt(Math.max(0.1, heightInFeet) / 2); // Use Math.max to avoid issues with very small positive numbers
    };
    
    // Flow rates for different drain sizes (in gallons per minute)
    const DRAIN_FLOW_RATES = {
        'small': 3,    // Small drain: ~3 GPM
        'medium': 6,   // Medium drain: ~6 GPM
        'large': 10    // Large drain: ~10 GPM
    };
    
    // Manual draining rates (in gallons per minute per person)
    const MANUAL_DRAIN_RATE = 2; // ~2 GPM per person
    
    // Environmental tips based on water treatment
    const ENVIRONMENTAL_TIPS = {
        noChemicals: [
            "Use the pool water to irrigate your lawn or garden plants",
            "Water trees, shrubs, or flowerbeds that need moisture",
            "Avoid draining onto vegetable gardens if sunscreen or other products were used in the water",
            "Drain in different areas to prevent oversaturation of any single spot"
        ],
        chlorinated: [
            "Let the pool sit unused for 1-2 days to allow chlorine to dissipate before draining",
            "Test chlorine levels before draining - they should be below 0.1 ppm for lawn irrigation",
            "Drain in a large area to dilute any remaining chemicals",
            "Avoid draining into storm drains, as chemicals can harm local waterways",
            "Check local regulations regarding pool water disposal"
        ],
        saltwater: [
            "Avoid draining saltwater pools onto lawns or gardens as salt can damage plants",
            "Direct saltwater to areas without vegetation or dilute it significantly with fresh water if allowed",
            "Consider draining in multiple locations to prevent salt buildup in any one area",
            "Check local regulations regarding saltwater pool disposal; specialized disposal might be required",
            "Some municipalities require special handling for saltwater pool drainage"
        ],
        otherChemicals: [ // Generic advice if other chemicals are used
            "Consult product instructions for safe disposal of chemically treated water",
            "Avoid draining into storm drains or directly onto sensitive vegetation",
            "Check local regulations regarding pool water disposal"
        ]
    };
    
    // Drainage method tips
    const DRAINAGE_METHOD_TIPS = {
        siphon: [
            "Ensure the hose is completely filled with water before starting the siphon",
            "The drainage end must be significantly lower than the pool water level for the siphon to work effectively",
            "The greater the height difference, the faster the siphon will drain",
            "For large pools, use multiple hoses simultaneously to speed up draining",
            "If the siphon stops, check for air bubbles or kinks in the hose"
        ],
        pump: [
            "Place the pump at the lowest point of the pool for most efficient draining",
            "Use a pump with a filter screen or pre-filter to prevent clogging from debris",
            "Check the pump periodically during operation to ensure it's working properly",
            "Have an extension cord ready if needed, and keep electrical connections away from water",
            "Some submersible pumps will stop automatically when the water level gets too low, others may need monitoring"
        ],
        drain: [
            "Remove any debris around the drain plug before opening",
            "For faster draining, create a slight slope in the pool toward the drain if possible",
            "Check the drain area periodically to ensure it's not becoming clogged",
            "Have a small brush ready to clear any debris that may block the drain",
            "The last few inches of water may drain very slowly - consider using a different method for final draining"
        ],
        manual: [
            "For small pools, lift one edge to direct water flow to a desired area",
            "Use buckets or containers to collect water for reuse if appropriate (check environmental tips)",
            "Have towels ready to clean up any spills during manual draining",
            "Work with a partner for larger pools to prevent spills and strain",
            "Consider using a wet/dry vacuum for the last bit of water or for pools with no other drain option"
        ]
    };
    
    // Add event listeners
    elements.calculateButton.addEventListener('click', calculateDrainageTime);
    elements.calculationMethod.addEventListener('change', toggleCalculationMethod);
    elements.poolShape.addEventListener('change', togglePoolShape);
    elements.drainageMethod.addEventListener('change', toggleDrainageMethod);
    
    // Add input validation
    addValidationListeners();
    
    /**
     * Toggles between volume and dimensions calculation methods
     */
    function toggleCalculationMethod() {
        const method = elements.calculationMethod.value;
        
        if (method === 'volume') {
            elements.volumeSection.style.display = 'block';
            elements.dimensionsSection.style.display = 'none';
        } else {
            elements.volumeSection.style.display = 'none';
            elements.dimensionsSection.style.display = 'block';
        }
    }
    
    /**
     * Toggles display of pool shape specific dimension inputs
     */
    function togglePoolShape() {
        const shape = elements.poolShape.value;
        
        // Hide all shape-specific dimensions first
        elements.roundDimensions.style.display = 'none';
        elements.rectangularDimensions.style.display = 'none';
        elements.ovalDimensions.style.display = 'none';
        
        // Show dimensions based on selected shape
        if (shape === 'round') {
            elements.roundDimensions.style.display = 'block';
        } else if (shape === 'rectangular') {
            elements.rectangularDimensions.style.display = 'block';
        } else if (shape === 'oval') {
            elements.ovalDimensions.style.display = 'block';
        }
    }
    
    /**
     * Toggles display of drainage method specific options
     */
    function toggleDrainageMethod() {
        const method = elements.drainageMethod.value;
        
        // Hide all method-specific options first
        elements.siphonOptions.style.display = 'none';
        elements.pumpOptions.style.display = 'none';
        elements.drainOptions.style.display = 'none';
        elements.manualOptions.style.display = 'none';
        
        // Show options based on selected method
        if (method === 'siphon') {
            elements.siphonOptions.style.display = 'block';
        } else if (method === 'pump') {
            elements.pumpOptions.style.display = 'block';
        } else if (method === 'drain') {
            elements.drainOptions.style.display = 'block';
        } else if (method === 'manual') {
            elements.manualOptions.style.display = 'block';
        }
    }
    
    /**
     * Adds validation listeners to all input fields
     */
    function addValidationListeners() {
        // Validate numeric inputs for volume
        elements.waterVolume.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        // Validate numeric inputs for dimensions
        elements.diameter.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.length.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.width.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.longDiameter.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.shortDiameter.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.depth.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        // Validate numeric inputs for drainage options
        elements.heightDifference.addEventListener('input', function() {
            validateNonNegativeNumber(this);
        });
        
        elements.pumpFlow.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.helpers.addEventListener('input', function() {
            validateRange(this, 1, 5);
        });
    }
    
    /**
     * Validates that an input contains a positive number
     * @param {HTMLElement} input - The input element to validate
     * @returns {boolean} - Whether the input is valid
     */
    function validatePositiveNumber(input) {
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
     * Validates that an input contains a non-negative number
     * @param {HTMLElement} input - The input element to validate
     * @returns {boolean} - Whether the input is valid
     */
    function validateNonNegativeNumber(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value >= 0;
        
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
     * Validates that an input contains a number within a specified range
     * @param {HTMLElement} input - The input element to validate
     * @param {number} min - The minimum allowed value
     * @param {number} max - The maximum allowed value
     * @returns {boolean} - Whether the input is valid
     */
    function validateRange(input, min, max) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value >= min && value <= max;
        
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
     * Validates all form inputs
     * @returns {boolean} - Whether all inputs are valid
     */
    function validateForm() {
        let isValid = true;
        const errorMessages = [];
        
        // Clear previous error messages
        elements.errorContainer.innerHTML = '';
        
        // Validate based on calculation method
        if (elements.calculationMethod.value === 'volume') {
            if (!validatePositiveNumber(elements.waterVolume)) {
                errorMessages.push('Water volume must be a positive number.');
                isValid = false;
            }
        } else {
            // Validate dimensions based on pool shape
            const shape = elements.poolShape.value;
            
            if (shape === 'round') {
                if (!validatePositiveNumber(elements.diameter)) {
                    errorMessages.push('Diameter must be a positive number.');
                    isValid = false;
                }
            } else if (shape === 'rectangular') {
                if (!validatePositiveNumber(elements.length)) {
                    errorMessages.push('Length must be a positive number.');
                    isValid = false;
                }
                if (!validatePositiveNumber(elements.width)) {
                    errorMessages.push('Width must be a positive number.');
                    isValid = false;
                }
            } else if (shape === 'oval') {
                if (!validatePositiveNumber(elements.longDiameter)) {
                    errorMessages.push('Long diameter must be a positive number.');
                    isValid = false;
                }
                if (!validatePositiveNumber(elements.shortDiameter)) {
                    errorMessages.push('Short diameter must be a positive number.');
                    isValid = false;
                }
            }
            
            // Validate depth
            if (!validatePositiveNumber(elements.depth)) {
                errorMessages.push('Depth must be a positive number.');
                isValid = false;
            }
        }
        
        // Validate drainage method options
        const drainageMethod = elements.drainageMethod.value;
        
        if (drainageMethod === 'siphon') {
            if (!validateNonNegativeNumber(elements.heightDifference)) {
                errorMessages.push('Height difference must be a non-negative number.');
                isValid = false;
            }
        } else if (drainageMethod === 'pump') {
            if (!validatePositiveNumber(elements.pumpFlow)) {
                errorMessages.push('Pump flow rate must be a positive number.');
                isValid = false;
            }
        } else if (drainageMethod === 'manual') {
            if (!validateRange(elements.helpers, 1, 5)) {
                errorMessages.push('Number of helpers must be between 1 and 5.');
                isValid = false;
            }
        }
        
        // Add specific error messages
        if (!isValid) {
            if (errorMessages.length > 0) {
                const ul = document.createElement('ul');
                ul.style.margin = '5px 0';
                ul.style.paddingLeft = '20px';
                
                errorMessages.forEach(message => {
                    const li = document.createElement('li');
                    li.textContent = message;
                    ul.appendChild(li);
                });
                elements.errorContainer.appendChild(ul);
            } else {
                // Fallback generic message if no specific errors were collected (should be rare)
                addError("Please correct the highlighted fields before calculating drainage time.");
            }
        }
        
        return isValid;
    }
    
    /**
     * Adds an error message to the error container (used as a fallback)
     * @param {string} message - The error message to display
     */
    function addError(message) {
        const errorElement = document.createElement('p');
        errorElement.textContent = message;
        errorElement.className = 'error-message';
        elements.errorContainer.appendChild(errorElement);
    }
    
    /**
     * Calculates the drainage time based on form inputs
     */
    function calculateDrainageTime() {
        // Validate form
        if (!validateForm()) {
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Get form values
        const calculationMethod = elements.calculationMethod.value;
        const drainageMethod = elements.drainageMethod.value;
        
        let waterVolume;
        
        // Calculate water volume based on calculation method
        if (calculationMethod === 'volume') {
            waterVolume = getVolumeInGallons(
                parseFloat(elements.waterVolume.value),
                elements.volumeUnit.value
            );
        } else {
            waterVolume = calculateVolumeFromDimensions();
        }

        // If waterVolume calculation failed (e.g., due to unknown unit), stop.
        if (isNaN(waterVolume)) {
            // Error message already shown by getVolumeInGallons or getLengthInFeet
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Calculate flow rate based on drainage method
        let flowRate;
        
        if (drainageMethod === 'siphon') {
            const hoseSize = elements.hoseSize.value;
            const heightDifference = getLengthInFeet(
                parseFloat(elements.heightDifference.value),
                elements.heightUnit.value
            );
            if (isNaN(heightDifference)) { // Check if getLengthInFeet failed
                 elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
                 return;
            }
            
            // Calculate siphon flow rate
            const baseFlowRate = SIPHON_FLOW_RATES[hoseSize];
            const heightMultiplier = HEIGHT_DIFFERENCE_MULTIPLIER(heightDifference);
            flowRate = baseFlowRate * heightMultiplier;
        } else if (drainageMethod === 'pump') {
            // Get pump flow rate
            flowRate = getFlowRateInGPM(
                parseFloat(elements.pumpFlow.value),
                elements.flowUnit.value
            );
             if (isNaN(flowRate)) { // Check if getFlowRateInGPM failed
                 elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
                 return;
            }
        } else if (drainageMethod === 'drain') {
            // Get drain flow rate
            const drainSize = elements.drainSize.value;
            flowRate = DRAIN_FLOW_RATES[drainSize];
        } else if (drainageMethod === 'manual') {
            // Calculate manual flow rate
            const helpers = parseInt(elements.helpers.value);
            flowRate = MANUAL_DRAIN_RATE * helpers;
        }

        // Ensure flowRate is a positive number to avoid division by zero or negative time
        if (isNaN(flowRate) || flowRate <= 0) {
            addError("Calculated flow rate is invalid. Please check drainage method inputs.");
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Calculate drainage time in minutes
        const drainageTimeMinutes = waterVolume / flowRate;
        
        // Generate drainage tips
        const drainageTips = DRAINAGE_METHOD_TIPS[drainageMethod];
        
        // Get environmental tips based on water treatment type
        const waterTreatmentValue = elements.waterTreatment && elements.waterTreatment.value 
                                    ? elements.waterTreatment.value 
                                    : 'chlorinated'; // Default to chlorinated if element or value is missing
        const environmentalTips = ENVIRONMENTAL_TIPS[waterTreatmentValue] || ENVIRONMENTAL_TIPS.chlorinated;
        
        // Display results
        displayResults(
            drainageTimeMinutes,
            waterVolume,
            flowRate,
            drainageMethod,
            drainageTips,
            environmentalTips
        );
        
        // Show results section
        elements.results.style.display = 'block';
        
        // Scroll to results
        elements.results.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Calculates volume from dimensions
     * @returns {number} - Volume in gallons, or NaN if an error occurs
     */
    function calculateVolumeFromDimensions() {
        const shape = elements.poolShape.value;
        let volume = NaN; // Initialize to NaN
        
        // Get depth in feet
        const depth = getLengthInFeet(
            parseFloat(elements.depth.value),
            elements.depthUnit.value
        );
        if (isNaN(depth)) return NaN; // Propagate NaN

        let cubicFeet = NaN;
        
        if (shape === 'round') {
            const diameter = getLengthInFeet(
                parseFloat(elements.diameter.value),
                elements.diameterUnit.value
            );
            if (isNaN(diameter)) return NaN;
            const radius = diameter / 2;
            cubicFeet = PI * radius * radius * depth;
        } else if (shape === 'rectangular') {
            const length = getLengthInFeet(
                parseFloat(elements.length.value),
                elements.lengthUnit.value
            );
            if (isNaN(length)) return NaN;
            const width = getLengthInFeet(
                parseFloat(elements.width.value),
                elements.widthUnit.value
            );
            if (isNaN(width)) return NaN;
            cubicFeet = length * width * depth;
        } else if (shape === 'oval') {
            const longDiameter = getLengthInFeet(
                parseFloat(elements.longDiameter.value),
                elements.longDiameterUnit.value
            );
            if (isNaN(longDiameter)) return NaN;
            const shortDiameter = getLengthInFeet(
                parseFloat(elements.shortDiameter.value),
                elements.shortDiameterUnit.value
            );
            if (isNaN(shortDiameter)) return NaN;
            const a = longDiameter / 2;
            const b = shortDiameter / 2;
            cubicFeet = PI * a * b * depth;
        }
        
        if (!isNaN(cubicFeet)) {
            volume = cubicFeet * GALLONS_PER_CUBIC_FOOT;
        }
        return volume;
    }
    
    /**
     * Displays the drainage time results
     */
    function displayResults(
        drainageTimeMinutes,
        waterVolume,
        flowRate,
        drainageMethod,
        drainageTips,
        environmentalTips
    ) {
        // Format drainage time for display
        const formattedDrainageTime = formatTime(drainageTimeMinutes);
        
        // Display drainage time
        elements.drainageTimeResult.innerHTML = `
            <p class="time-result">Approximately <strong>${formattedDrainageTime}</strong></p>
            <p>This is the estimated time to drain ${Math.round(waterVolume)} gallons of water using a ${formatDrainageMethod(drainageMethod)}.</p>
        `;
        
        // Display drainage details
        elements.detailsResult.innerHTML = `
            <p>Water Volume: <strong>${Math.round(waterVolume)} gallons</strong> (${Math.round(waterVolume * GALLONS_TO_LITERS)} liters)</p>
            <p>Flow Rate: <strong>${flowRate.toFixed(1)} gallons per minute</strong> (${(flowRate * GALLONS_TO_LITERS).toFixed(1)} liters per minute)</p>
            <p>Drainage Method: <strong>${formatDrainageMethod(drainageMethod)}</strong></p>
        `;
        
        // Display drainage tips
        elements.tipsResult.innerHTML = '<ul>';
        drainageTips.forEach(tip => {
            elements.tipsResult.innerHTML += `<li>${tip}</li>`;
        });
        elements.tipsResult.innerHTML += '</ul>';
        
        // Display environmental considerations
        elements.environmentalResult.innerHTML = `
            <p>Consider these environmental tips when draining your pool:</p>
            <ul>
                ${environmentalTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
    }
    
    /**
     * Formats time in hours and minutes
     * @param {number} minutes - Time in minutes
     * @returns {string} - Formatted time string
     */
    function formatTime(minutes) {
        if (isNaN(minutes) || minutes === Infinity || minutes < 0) {
            return "N/A (check inputs)";
        }
        if (minutes < 1) {
            return "less than 1 minute";
        } else if (minutes < 60) {
            return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            
            if (remainingMinutes === 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            } else {
                return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
            }
        }
    }
    
    /**
     * Formats drainage method for display
     * @param {string} method - Drainage method
     * @returns {string} - Formatted drainage method
     */
    function formatDrainageMethod(method) {
        switch (method) {
            case 'siphon':
                return 'Garden Hose Siphon';
            case 'pump':
                return 'Submersible Pump';
            case 'drain':
                return 'Built-in Drain Plug';
            case 'manual':
                return 'Manual Draining';
            default:
                return method;
        }
    }
    
    /**
     * Converts a length to feet
     * @param {number} length - Length value
     * @param {string} unit - Length unit
     * @returns {number} - Length in feet or NaN if unit is unknown
     */
    function getLengthInFeet(length, unit) {
        switch (unit) {
            case 'feet':
                return length;
            case 'meters':
                return length * METERS_TO_FEET;
            case 'inches':
                return length * INCHES_TO_FEET;
            case 'cm':
                return length * CM_TO_METERS * METERS_TO_FEET;
            default:
                console.error(`Unknown length unit: ${unit}`);
                addError(`Error: Unknown length unit '${unit}'. Please select a valid unit.`);
                return NaN;
        }
    }
    
    /**
     * Converts a volume to gallons
     * @param {number} volume - Volume value
     * @param {string} unit - Volume unit
     * @returns {number} - Volume in gallons or NaN if unit is unknown
     */
    function getVolumeInGallons(volume, unit) {
        switch (unit) {
            case 'gallons':
                return volume;
            case 'liters':
                return volume * LITERS_TO_GALLONS;
            default:
                console.error(`Unknown volume unit: ${unit}`);
                addError(`Error: Unknown volume unit '${unit}'. Please select a valid unit.`);
                return NaN;
        }
    }
    
    /**
     * Converts a flow rate to gallons per minute
     * @param {number} flowRate - Flow rate value
     * @param {string} unit - Flow rate unit
     * @returns {number} - Flow rate in gallons per minute or NaN if unit is unknown
     */
    function getFlowRateInGPM(flowRate, unit) {
        switch (unit) {
            case 'gph': // gallons per hour
                return flowRate / 60;
            case 'lpm': // liters per minute
                return flowRate * LITERS_TO_GALLONS; 
            case 'lph': // liters per hour
                return (flowRate * LITERS_TO_GALLONS) / 60;
            default: // Assuming GPM if unit is unknown or 'gpm'
                if (unit !== 'gpm') { // Only log error if it's truly unknown, not if it's 'gpm'
                    console.error(`Unknown flow rate unit: ${unit}. Assuming GPM.`);
                    addError(`Error: Unknown flow rate unit '${unit}'. Assuming GPM and using value as is.`);
                    // Depending on strictness, could return NaN here, but for now, assume GPM.
                }
                return flowRate; 
        }
    }
    
    // Initialize elements and event listeners
    elements.init(); 
    initEventListeners(); // Assuming this function sets up basic calculate button listener etc.
    
    // Initial UI setup calls
    toggleCalculationMethod();
    togglePoolShape();
    toggleDrainageMethod();
});