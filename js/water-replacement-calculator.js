/**
 * Water Replacement Calculator for Kiddie Pools
 * 
 * This script calculates the optimal water replacement schedule for kiddie pools
 * based on pool characteristics, usage patterns, and environmental factors.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Named constants for thresholds used in calculations
    const POOL_SIZE = {
        TINY_MAX: 50,      // Maximum gallons for tiny pool classification
        SMALL_MAX: 150,    // Maximum gallons for small pool classification
        MEDIUM_MAX: 300    // Maximum gallons for medium pool classification
    };
    
    const USER_COUNT = {
        FEW_MAX: 2,        // Maximum users for 'few' classification
        MODERATE_MAX: 5,   // Maximum users for 'moderate' classification
        HIGH_THRESHOLD: 5  // Threshold for 'high number of users' warning
    };
    
    const VALIDATION = {
        MAX_USERS: 20,     // Maximum number of users allowed
        MAX_DAYS: 60       // Maximum days since last change allowed
    };
    
    // Cache DOM elements
    const elements = {
        // Form elements
        form: document.getElementById('waterReplacementForm'),
        errorContainer: document.getElementById('errorContainer'),
        // Set ARIA attributes for error container
        init: function() {
            if (this.errorContainer) {
                this.errorContainer.setAttribute('role', 'alert');
                this.errorContainer.setAttribute('aria-live', 'assertive');
            }
            return this;
        },
        poolType: document.getElementById('poolType'),
        poolVolume: document.getElementById('poolVolume'),
        volumeUnit: document.getElementById('volumeUnit'),
        surfaceArea: document.getElementById('surfaceArea'),
        areaUnit: document.getElementById('areaUnit'),
        usageFrequency: document.getElementById('usageFrequency'),
        averageUsers: document.getElementById('averageUsers'),
        childrenUsers: document.getElementById('childrenUsers'),
        petsUsers: document.getElementById('petsUsers'),
        climate: document.getElementById('climate'),
        sunExposure: document.getElementById('sunExposure'),
        surroundings: document.getElementById('surroundings'),
        covered: document.getElementById('covered'),
        chemicalUse: document.getElementById('chemicalUse'),
        filterSystem: document.getElementById('filterSystem'),
        waterQuality: document.getElementById('waterQuality'),
        lastChange: document.getElementById('lastChange'),
        calculateButton: document.getElementById('calculateButton'),
        
        // Results elements
        results: document.getElementById('results'),
        recommendationResult: document.getElementById('recommendationResult'),
        detailsResult: document.getElementById('detailsResult'),
        factorsResult: document.getElementById('factorsResult'),
        nextStepsResult: document.getElementById('nextStepsResult'),
        conservationResult: document.getElementById('conservationResult')
    };
    
    // Constants for calculations
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const SQFT_TO_SQM = 0.092903;
    const SQM_TO_SQFT = 10.7639;
    
    // Water quality degradation factors (days until water quality decreases by one level)
    const WATER_DEGRADATION_FACTORS = {
        // Base factors by pool size (in gallons)
        size: {
            tiny: 1.5,      // < 50 gallons
            small: 2.5,     // 50-150 gallons
            medium: 3.5,    // 150-300 gallons
            large: 5.0      // > 300 gallons
        },
        
        // Multipliers for various factors
        chemical: {
            none: 0.5,                      // No chemicals (degrades faster)
            minimal: 1.0,                   // Minimal chemicals
            regular: 1.8,                   // Regular chemical treatment
            full: 2.5                       // Full chemical treatment
        },
        
        usage: {
            daily: 0.5,                     // Daily use (degrades faster)
            several: 0.7,                   // Several times per week
            weekly: 1.2,                    // Weekly use
            occasional: 1.5                 // Occasional use
        },
        
        users: {
            few: 1.0,                       // 1-2 users
            moderate: 0.7,                  // 3-5 users
            many: 0.5                       // 6+ users
        },
        
        children: {
            yes: 0.6,                       // Children under 6 (degrades faster)
            no: 1.0                         // No young children
        },
        
        pets: {
            yes: 0.5,                       // Pets use pool (degrades faster)
            no: 1.0                         // No pets
        },
        
        climate: {
            hot: 0.6,                       // Hot climate (degrades faster)
            moderate: 1.0,                  // Moderate climate
            cool: 1.4                       // Cool climate
        },
        
        sun: {
            full: 0.6,                      // Full sun (degrades faster)
            partial: 0.8,                   // Partial sun
            minimal: 1.2,                   // Minimal sun
            shade: 1.5                      // Shade
        },
        
        surroundings: {
            clean: 1.3,                     // Clean patio/deck
            grass: 1.0,                     // Grass/lawn
            trees: 0.7,                     // Near trees/plants (more debris)
            dusty: 0.6                      // Dusty/sandy area
        },
        
        covered: {
            always: 1.5,                    // Always covered when not in use
            sometimes: 1.2,                 // Sometimes covered
            never: 0.8                      // Never covered
        },
        
        filter: {
            none: 0.7,                      // No filter (degrades faster)
            basic: 1.2,                     // Basic filter
            standard: 1.8                   // Standard filter system
        }
    };
    
    // Water quality levels and their descriptions
    const WATER_QUALITY_LEVELS = [
        {
            level: "excellent",
            description: "Crystal clear, properly sanitized, no visible debris or odor",
            action: "No immediate action needed"
        },
        {
            level: "good",
            description: "Clear with minimal debris, properly sanitized, no odor",
            action: "Continue regular maintenance"
        },
        {
            level: "fair",
            description: "Slightly cloudy or with some debris, may need additional sanitizer",
            action: "Add sanitizer and remove debris"
        },
        {
            level: "poor",
            description: "Cloudy, visible debris, possible algae beginning, may have slight odor",
            action: "Consider partial or full water change, shock treatment if using chemicals"
        },
        {
            level: "very poor",
            description: "Very cloudy, significant debris, visible algae, unpleasant odor",
            action: "Immediate full water change recommended"
        }
    ];
    
    // Water conservation tips based on pool size
    const WATER_CONSERVATION_TIPS = {
        tiny: [
            "Use a bucket to collect the old pool water for watering plants (if no chemicals were used)",
            "Consider using a small pool cover to reduce evaporation and debris",
            "Rinse off children before entering to reduce contaminants"
        ],
        small: [
            "Use the old pool water for watering non-edible plants (if minimal chemicals were used)",
            "Use a pool cover to reduce evaporation and debris",
            "Consider a small filter to extend water life",
            "Rinse off before entering to reduce contaminants"
        ],
        medium: [
            "Use a pool cover when not in use to reduce evaporation and debris",
            "Consider a basic filtration system to extend water life",
            "Implement proper chemical treatment to reduce water changes",
            "Rinse off before entering to reduce contaminants",
            "Consider partial water changes instead of full changes when possible"
        ],
        large: [
            "Use a quality pool cover when not in use",
            "Implement a proper filtration system",
            "Maintain proper chemical balance to extend water life",
            "Consider partial water changes (25-50%) instead of full changes",
            "Create a maintenance schedule to optimize water usage",
            "Rinse off before entering to reduce contaminants"
        ]
    };
    
    // Initialize ARIA attributes
    elements.init();
    
    // Add event listeners
    elements.calculateButton.addEventListener('click', calculateReplacementSchedule);
    
    // Add input validation
    addValidationListeners();
    
    /**
     * Adds validation listeners to all input fields
     */
    function addValidationListeners() {
        // Validate numeric inputs
        elements.poolVolume.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.surfaceArea.addEventListener('input', function() {
            validateNonNegativeNumber(this);
        });
        
        elements.averageUsers.addEventListener('input', function() {
            validateRange(this, 1, 20);
        });
        
        elements.lastChange.addEventListener('input', function() {
            validateRange(this, 0, 60);
        });
        
        // Revalidate when units change
        elements.volumeUnit.addEventListener('change', function() {
            validatePositiveNumber(elements.poolVolume);
        });
        
        elements.areaUnit.addEventListener('change', function() {
            validateNonNegativeNumber(elements.surfaceArea);
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
        
        // Clear previous error messages
        elements.errorContainer.innerHTML = '';
        
        // Validate pool volume
        if (!validatePositiveNumber(elements.poolVolume)) {
            addError("Please enter a valid positive number for pool volume.");
            isValid = false;
        }
        
        // Validate surface area if provided
        if (parseFloat(elements.surfaceArea.value) !== 0 && !validateNonNegativeNumber(elements.surfaceArea)) {
            addError("Please enter a valid non-negative number for surface area or leave at 0 if unknown.");
            isValid = false;
        }
        
        // Validate average users
        if (!validateRange(elements.averageUsers, 1, VALIDATION.MAX_USERS)) {
            addError(`Please enter a valid number of users between 1 and ${VALIDATION.MAX_USERS}.`);
            isValid = false;
        }
        
        // Validate days since last change
        if (!validateRange(elements.lastChange, 0, VALIDATION.MAX_DAYS)) {
            addError(`Please enter a valid number of days between 0 and ${VALIDATION.MAX_DAYS}.`);
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Adds an error message to the error container
     * @param {string} message - The error message to display
     */
    function addError(message) {
        const errorElement = document.createElement('p');
        errorElement.textContent = message;
        errorElement.className = 'error-message';
        elements.errorContainer.appendChild(errorElement);
        // ARIA attributes already set on container initialization
    }
    
    /**
     * Calculates the water replacement schedule based on form inputs
     */
    function calculateReplacementSchedule() {
        // Validate form
        if (!validateForm()) {
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Get form values
        const poolType = elements.poolType.value;
        const poolVolume = getVolumeInGallons();
        const usageFrequency = elements.usageFrequency.value;
        const averageUsers = parseInt(elements.averageUsers.value);
        const childrenUsers = elements.childrenUsers.value;
        const petsUsers = elements.petsUsers.value;
        const climate = elements.climate.value;
        const sunExposure = elements.sunExposure.value;
        const surroundings = elements.surroundings.value;
        const covered = elements.covered.value;
        const chemicalUse = elements.chemicalUse.value;
        const filterSystem = elements.filterSystem.value;
        const currentWaterQuality = elements.waterQuality.value;
        const daysSinceLastChange = parseInt(elements.lastChange.value);
        
        // Calculate water degradation rate
        const degradationRate = calculateDegradationRate(
            poolVolume, 
            usageFrequency, 
            averageUsers, 
            childrenUsers,
            petsUsers,
            climate, 
            sunExposure, 
            surroundings, 
            covered, 
            chemicalUse, 
            filterSystem
        );
        
        // Calculate current water quality level
        const currentQualityLevel = calculateCurrentQualityLevel(
            currentWaterQuality,
            daysSinceLastChange,
            degradationRate
        );
        
        // Calculate days until water change needed
        const daysUntilChange = calculateDaysUntilChange(
            currentQualityLevel,
            degradationRate
        );
        
        // Generate water conservation tips using the already calculated pool size category
        const conservationTips = generateConservationTips(degradationRate.poolSizeCategory);
        
        // Generate next steps
        const nextSteps = generateNextSteps(
            daysUntilChange,
            currentQualityLevel,
            chemicalUse,
            filterSystem
        );
        
        // Generate water quality factors
        const qualityFactors = generateQualityFactors(
            usageFrequency,
            averageUsers,
            childrenUsers,
            petsUsers,
            climate,
            sunExposure,
            surroundings,
            covered,
            chemicalUse,
            filterSystem
        );
        
        // Display results
        displayResults(
            daysUntilChange,
            currentQualityLevel,
            degradationRate,
            qualityFactors,
            nextSteps,
            conservationTips
        );
        
        // Show results section
        elements.results.style.display = 'block';
        
        // Scroll to results
        elements.results.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Calculates the water degradation rate based on pool characteristics
     * @returns {number} - Water degradation rate in days per quality level
     */
    function calculateDegradationRate(
        poolVolume, 
        usageFrequency, 
        averageUsers, 
        childrenUsers,
        petsUsers,
        climate, 
        sunExposure, 
        surroundings, 
        covered, 
        chemicalUse, 
        filterSystem
    ) {
        // Determine base degradation rate based on pool size
        let baseDegradationRate;
        let poolSizeCategory;
        
        if (poolVolume < POOL_SIZE.TINY_MAX) {
            baseDegradationRate = WATER_DEGRADATION_FACTORS.size.tiny;
            poolSizeCategory = 'tiny';
        } else if (poolVolume < POOL_SIZE.SMALL_MAX) {
            baseDegradationRate = WATER_DEGRADATION_FACTORS.size.small;
            poolSizeCategory = 'small';
        } else if (poolVolume < POOL_SIZE.MEDIUM_MAX) {
            baseDegradationRate = WATER_DEGRADATION_FACTORS.size.medium;
            poolSizeCategory = 'medium';
        } else {
            baseDegradationRate = WATER_DEGRADATION_FACTORS.size.large;
            poolSizeCategory = 'large';
        }
        
        // Determine user count factor
        let userFactor;
        if (averageUsers <= USER_COUNT.FEW_MAX) {
            userFactor = WATER_DEGRADATION_FACTORS.users.few;
        } else if (averageUsers <= USER_COUNT.MODERATE_MAX) {
            userFactor = WATER_DEGRADATION_FACTORS.users.moderate;
        } else {
            userFactor = WATER_DEGRADATION_FACTORS.users.many;
        }
        
        // Apply all factors to calculate adjusted degradation rate
        const adjustedDegradationRate = baseDegradationRate * 
            WATER_DEGRADATION_FACTORS.chemical[chemicalUse] * 
            WATER_DEGRADATION_FACTORS.usage[usageFrequency] * 
            userFactor * 
            WATER_DEGRADATION_FACTORS.children[childrenUsers] * 
            WATER_DEGRADATION_FACTORS.pets[petsUsers] * 
            WATER_DEGRADATION_FACTORS.climate[climate] * 
            WATER_DEGRADATION_FACTORS.sun[sunExposure] * 
            WATER_DEGRADATION_FACTORS.surroundings[surroundings] * 
            WATER_DEGRADATION_FACTORS.covered[covered] * 
            WATER_DEGRADATION_FACTORS.filter[filterSystem];
        
        return {
            rate: adjustedDegradationRate,
            poolSizeCategory: poolSizeCategory
        };
    }
    
    /**
     * Calculates the current water quality level based on initial quality and time passed
     * @returns {number} - Current water quality level index (0-4, where 0 is excellent)
     */
    function calculateCurrentQualityLevel(currentWaterQuality, daysSinceLastChange, degradationRate) {
        // Determine initial quality level index
        let initialQualityIndex;
        switch (currentWaterQuality) {
            case 'clear':
                initialQualityIndex = 0; // Excellent
                break;
            case 'slightly':
                initialQualityIndex = 1; // Good
                break;
            case 'cloudy':
                initialQualityIndex = 2; // Fair
                break;
            case 'algae':
                initialQualityIndex = 3; // Poor
                break;
            case 'debris':
                initialQualityIndex = 3; // Poor
                break;
            default:
                initialQualityIndex = 0;
        }
        
        // Calculate quality degradation based on time passed
        const qualityDegradation = Math.floor(daysSinceLastChange / degradationRate.rate);
        
        // Calculate current quality level (capped at 4 - very poor)
        return Math.min(initialQualityIndex + qualityDegradation, 4);
    }
    
    /**
     * Calculates days until water change is needed
     * @returns {number} - Days until water change is recommended
     */
    function calculateDaysUntilChange(currentQualityLevel, degradationRate) {
        // If water quality is already very poor, change immediately
        if (currentQualityLevel >= 4) {
            return 0;
        }
        
        // Calculate days until water quality reaches "very poor" level
        const levelsUntilVeryPoor = 4 - currentQualityLevel;
        const daysUntilVeryPoor = Math.ceil(levelsUntilVeryPoor * degradationRate.rate);
        
        // Recommend changing before reaching "very poor" - when reaching "poor"
        const daysUntilPoor = Math.ceil((3 - currentQualityLevel) * degradationRate.rate);
        
        // If already poor or worse, recommend immediate change
        if (currentQualityLevel >= 3) {
            return 0;
        }
        
        return daysUntilPoor;
    }
    
    /**
     * Generates water conservation tips based on pool size category
     * @param {string} poolSizeCategory - The pool size category ('tiny', 'small', 'medium', 'large')
     * @returns {Array} - Array of conservation tips
     */
    function generateConservationTips(poolSizeCategory) {
        // Simply return the tips for the given category - no need to recalculate
        return WATER_CONSERVATION_TIPS[poolSizeCategory];
    }
    
    /**
     * Generates next steps based on days until change and current quality
     * @returns {Array} - Array of next steps
     */
    function generateNextSteps(daysUntilChange, currentQualityLevel, chemicalUse, filterSystem) {
        const nextSteps = [];
        
        // Get current quality level description
        const currentQuality = WATER_QUALITY_LEVELS[currentQualityLevel];
        
        // Add immediate action if needed
        if (daysUntilChange === 0) {
            nextSteps.push("Change water immediately - current water quality is too poor");
        } else {
            nextSteps.push(`Change water within ${daysUntilChange} days`);
        }
        
        // Add current quality action
        nextSteps.push(currentQuality.action);
        
        // Add chemical recommendations if using chemicals
        if (chemicalUse !== 'none') {
            if (currentQualityLevel >= 2) {
                nextSteps.push("Test and adjust chemical levels before next use");
            }
            if (currentQualityLevel >= 3) {
                nextSteps.push("Consider shock treatment if continuing to use current water");
            }
        }
        
        // Add filter recommendations if using a filter
        if (filterSystem !== 'none') {
            nextSteps.push("Clean or check filter before next use");
        }
        
        // Add general maintenance steps
        nextSteps.push("Remove any visible debris");
        if (currentQualityLevel >= 2) {
            nextSteps.push("Wipe down pool surfaces during next water change");
        }
        
        return nextSteps;
    }
    
    /**
     * Generates water quality factors affecting degradation rate
     * @returns {Array} - Array of factors and their impact
     */
    function generateQualityFactors(
        usageFrequency,
        averageUsers,
        childrenUsers,
        petsUsers,
        climate,
        sunExposure,
        surroundings,
        covered,
        chemicalUse,
        filterSystem
    ) {
        const factors = [];
        
        // Add factors that significantly impact water quality
        
        // Usage factors
        if (usageFrequency === 'daily') {
            factors.push("Daily usage significantly decreases water quality");
        }
        
        if (averageUsers > USER_COUNT.HIGH_THRESHOLD) {
            factors.push("High number of users significantly decreases water quality");
        }
        
        if (childrenUsers === 'yes') {
            factors.push("Young children decrease water quality faster");
        }
        
        if (petsUsers === 'yes') {
            factors.push("Pets significantly decrease water quality");
        }
        
        // Environmental factors
        if (climate === 'hot') {
            factors.push("Hot climate accelerates water quality degradation");
        }
        
        if (sunExposure === 'full') {
            factors.push("Full sun exposure promotes algae growth and decreases water quality");
        }
        
        if (surroundings === 'trees' || surroundings === 'dusty') {
            factors.push(`${surroundings === 'trees' ? 'Nearby trees/plants' : 'Dusty/sandy area'} introduces more debris into the water`);
        }
        
        // Maintenance factors
        if (covered === 'never') {
            factors.push("Lack of pool cover allows more debris and contaminants");
        }
        
        if (chemicalUse === 'none') {
            factors.push("No chemical treatment allows faster bacterial growth");
        } else if (chemicalUse === 'full') {
            factors.push("Full chemical treatment significantly extends water quality");
        }
        
        if (filterSystem === 'none') {
            factors.push("No filtration system allows debris to accumulate");
        } else if (filterSystem === 'standard') {
            factors.push("Standard filtration system significantly extends water quality");
        }
        
        return factors;
    }
    
    /**
     * Displays the water replacement schedule results
     */
    function displayResults(
        daysUntilChange,
        currentQualityLevel,
        degradationRate,
        qualityFactors,
        nextSteps,
        conservationTips
    ) {
        // Get current quality level description
        const currentQuality = WATER_QUALITY_LEVELS[currentQualityLevel];
        
        // Display recommendation
        if (daysUntilChange === 0) {
            elements.recommendationResult.innerHTML = `
                <p class="urgent-recommendation">Water change recommended immediately</p>
                <p>Current water quality: <strong>${currentQuality.level}</strong> - ${currentQuality.description}</p>
            `;
        } else {
            elements.recommendationResult.innerHTML = `
                <p>Water change recommended in <strong>${daysUntilChange} days</strong></p>
                <p>Current water quality: <strong>${currentQuality.level}</strong> - ${currentQuality.description}</p>
            `;
        }
        
        // Display detailed analysis
        elements.detailsResult.innerHTML = `
            <p>Based on your pool characteristics and usage patterns, your water quality degrades approximately every 
            <strong>${Math.round(degradationRate.rate * 10) / 10} days</strong>.</p>
            
            <p>With a ${degradationRate.poolSizeCategory} pool (${getVolumeInGallons().toFixed(1)} gallons), 
            ${elements.chemicalUse.value === 'none' ? 'no chemical treatment' : elements.chemicalUse.value + ' chemical treatment'}, 
            and ${elements.usageFrequency.value} usage, you should plan to change water more frequently than larger pools with less usage.</p>
        `;
        
        // Display water quality factors
        elements.factorsResult.innerHTML = '<ul>';
        qualityFactors.forEach(factor => {
            elements.factorsResult.innerHTML += `<li>${factor}</li>`;
        });
        elements.factorsResult.innerHTML += '</ul>';
        
        // Display next steps
        elements.nextStepsResult.innerHTML = '<ul>';
        nextSteps.forEach(step => {
            elements.nextStepsResult.innerHTML += `<li>${step}</li>`;
        });
        elements.nextStepsResult.innerHTML += '</ul>';
        
        // Display water conservation tips
        elements.conservationResult.innerHTML = '<ul>';
        conservationTips.forEach(tip => {
            elements.conservationResult.innerHTML += `<li>${tip}</li>`;
        });
        elements.conservationResult.innerHTML += '</ul>';
    }
    
    /**
     * Gets the pool volume in gallons regardless of input unit
     * @returns {number} - Pool volume in gallons
     */
    function getVolumeInGallons() {
        const volume = parseFloat(elements.poolVolume.value);
        const unit = elements.volumeUnit.value;
        
        if (unit === 'gallons') {
            return volume;
        } else {
            return volume * LITERS_TO_GALLONS;
        }
    }
    
    /**
     * Gets the surface area in square feet regardless of input unit
     * @returns {number} - Surface area in square feet
     */
    function getSurfaceAreaInSqFt() {
        const area = parseFloat(elements.surfaceArea.value);
        if (isNaN(area) || area === 0) {
            return 0; // Surface area not provided
        }
        
        const unit = elements.areaUnit.value;
        
        if (unit === 'sqft') {
            return area;
        } else {
            return area * SQM_TO_SQFT;
        }
    }
});
