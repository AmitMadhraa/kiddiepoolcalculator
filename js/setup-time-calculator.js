/**
 * Setup Time Calculator for Kiddie Pools
 * * This script calculates the estimated time to set up different types of kiddie pools
 * based on pool characteristics, user experience, and setup conditions.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Maximum number of items to display in lists (efficiency tips, checklist)
    const MAX_TIPS_DISPLAY = 5; // Capping tips for conciseness

    // Cache DOM elements
    const elements = {
        // Form elements
        form: document.getElementById('setupTimeForm'),
        errorContainer: document.getElementById('errorContainer'), // Ensure this div exists in your HTML
        
        // Initialize accessibility attributes for errorContainer
        init: function() {
            if (this.errorContainer) {
                this.errorContainer.setAttribute('role', 'alert');
                this.errorContainer.setAttribute('aria-live', 'assertive');
            }
            return this;
        },

        poolType: document.getElementById('poolType'),
        poolSize: document.getElementById('poolSize'),
        inflationMethod: document.getElementById('inflationMethod'),
        frameComplexity: document.getElementById('frameComplexity'),
        experienceLevel: document.getElementById('experienceLevel'),
        helpers: document.getElementById('helpers'),
        groundPrep: document.getElementById('groundPrep'),
        waterSource: document.getElementById('waterSource'),
        calculateButton: document.getElementById('calculateButton'),
        
        // Option containers
        inflatableOptions: document.querySelector('.inflatable-options'), // Use querySelector for class
        framedOptions: document.querySelector('.framed-options'),     // Use querySelector for class
        
        // Results elements
        results: document.getElementById('results'),
        totalTimeResult: document.getElementById('totalTimeResult'),
        breakdownResult: document.getElementById('breakdownResult'),
        tipsResult: document.getElementById('tipsResult'),
        toolsResult: document.getElementById('toolsResult')
    };
    
    // Base setup times in minutes for different pool types and sizes
    const BASE_SETUP_TIMES = {
        inflatable: { tiny: 5, small: 10, medium: 20, large: 40, xlarge: 60 },
        framed: { tiny: 15, small: 25, medium: 45, large: 90, xlarge: 150 },
        rigid: { tiny: 2, small: 5, medium: 10, large: 20, xlarge: 30 },
        softside: { tiny: 5, small: 10, medium: 20, large: 35, xlarge: 50 }
    };
    
    const INFLATION_MULTIPLIERS = { electric: 1.0, manual: 2.5, breath: 4.0 };
    const FRAME_COMPLEXITY_MULTIPLIERS = { simple: 0.8, moderate: 1.0, complex: 1.5 };
    const EXPERIENCE_MULTIPLIERS = { first: 1.5, some: 1.0, experienced: 0.7 };
    const HELPER_REDUCTION = 0.2; // 20% reduction per helper
    const MAX_HELPER_REDUCTION_EFFECT = 0.6; // Max 60% reduction (for 3+ effective helpers)
    
    const GROUND_PREP_TIMES = { none: 0, minimal: 10, moderate: 25, extensive: 45 };
    const WATER_FILL_TIMES = { hose: 10, indoor: 20, slow: 30 }; // minutes per 100 gallons
    const APPROXIMATE_GALLONS = { tiny: 30, small: 100, medium: 200, large: 500, xlarge: 1500 };
    
    const SETUP_TIPS = { /* ... (Keep your existing detailed SETUP_TIPS object) ... */ 
        inflatable: ["Check for a flat, debris-free surface before beginning setup", /* ... more tips */],
        framed: ["Organize all frame parts by type before beginning assembly", /* ... more tips */],
        rigid: ["Select a completely flat surface for setup", /* ... more tips */],
        softside: ["Ensure the outer material is fully extended before filling", /* ... more tips */]
    };
    const TOOLS_NEEDED = { /* ... (Keep your existing detailed TOOLS_NEEDED object) ... */ 
        inflatable: { basic: ["Air pump (electric or manual)", /* ... */], optional: [/* ... */] },
        framed: { basic: ["Ground cloth or tarp", /* ... */], optional: [/* ... */] },
        rigid: { basic: ["Garden hose"], optional: [/* ... */] },
        softside: { basic: ["Ground cloth or tarp", /* ... */], optional: [/* ... */] }
    };

    /**
     * Validates a required select element has a non-empty value
     * @param {HTMLSelectElement} selectElement - The select element to validate
     * @returns {boolean} - Whether the select element is valid
     */
    function validateRequiredSelect(selectElement) {
        const isValid = selectElement && selectElement.value !== ""; // Assumes default/placeholder option has value=""
        if (selectElement) {
            if (isValid) {
                selectElement.classList.remove('invalid-input');
                selectElement.setAttribute('aria-invalid', 'false');
            } else {
                selectElement.classList.add('invalid-input');
                selectElement.setAttribute('aria-invalid', 'true');
            }
        }
        return isValid;
    }

    /**
     * Validates that an input contains a number within a specified range
     * @param {HTMLInputElement} input - The input element to validate
     * @param {number} min - The minimum allowed value
     * @param {number} max - The maximum allowed value
     * @returns {boolean} - Whether the input is valid
     */
    function validateRange(input, min, max) {
        const value = parseInt(input.value); // Using parseInt for whole numbers like helpers
        const isValid = !isNaN(value) && value >= min && value <= max;
        
        if (input) {
            if (isValid) {
                input.classList.remove('invalid-input');
                input.setAttribute('aria-invalid', 'false');
            } else {
                input.classList.add('invalid-input');
                input.setAttribute('aria-invalid', 'true');
            }
        }
        return isValid;
    }
    
    /**
     * Displays error messages in the error container
     * @param {string[]} messages - Array of error messages
     */
    function displayErrorMessages(messages) {
        elements.errorContainer.innerHTML = ''; // Clear previous messages
        if (messages.length === 0) {
            elements.errorContainer.style.display = 'none';
            return;
        }
        
        const ul = document.createElement('ul');
        messages.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            ul.appendChild(li);
        });
        
        elements.errorContainer.appendChild(ul);
        elements.errorContainer.style.display = 'block';
    }

    /**
     * Validates all form inputs
     * @returns {boolean} - Whether all inputs are valid
     */
    function validateForm() {
        let isValid = true;
        const errorMessages = [];
        
        // Reset ARIA attributes and classes for all relevant form inputs
        const inputsToReset = [
            elements.poolType, elements.poolSize, elements.inflationMethod,
            elements.frameComplexity, elements.experienceLevel, elements.helpers,
            elements.groundPrep, elements.waterSource
        ];
        inputsToReset.forEach(input => {
            if (input) {
                input.classList.remove('invalid-input');
                input.setAttribute('aria-invalid', 'false');
            }
        });

        if (!validateRequiredSelect(elements.poolType)) {
            errorMessages.push("Please select a Pool Type.");
            isValid = false;
        }
        if (!validateRequiredSelect(elements.poolSize)) {
            errorMessages.push("Please select a Pool Size.");
            isValid = false;
        }

        const poolType = elements.poolType.value;
        if (poolType === 'inflatable') {
            if (!validateRequiredSelect(elements.inflationMethod)) {
                errorMessages.push("Please select an Inflation Method for inflatable pool.");
                isValid = false;
            }
        } else if (poolType === 'framed') {
            if (!validateRequiredSelect(elements.frameComplexity)) {
                errorMessages.push("Please select Frame Complexity for framed pool.");
                isValid = false;
            }
        }

        if (!validateRequiredSelect(elements.experienceLevel)) {
            errorMessages.push("Please select your Experience Level.");
            isValid = false;
        }
        if (!validateRequiredSelect(elements.groundPrep)) {
            errorMessages.push("Please select the Ground Preparation level.");
            isValid = false;
        }
        if (!validateRequiredSelect(elements.waterSource)) {
            errorMessages.push("Please select a Water Source.");
            isValid = false;
        }
        
        if (!validateRange(elements.helpers, 0, 5)) { // Allow 0 helpers
            errorMessages.push("Number of helpers must be between 0 and 5.");
            isValid = false;
        }
        
        displayErrorMessages(errorMessages);
        return isValid;
    }
    
    /**
     * Adds validation listeners to input fields for immediate feedback
     */
    function addValidationListeners() {
        elements.helpers.addEventListener('input', function() { validateRange(this, 0, 5); });

        const selectsToValidate = [
            elements.poolType, elements.poolSize, elements.inflationMethod,
            elements.frameComplexity, elements.experienceLevel, elements.groundPrep,
            elements.waterSource
        ];
        selectsToValidate.forEach(select => {
            if (select) {
                select.addEventListener('change', function() { 
                    validateRequiredSelect(this); 
                    // Optionally, if this was the only error, clear main error container
                    if (this.value && elements.errorContainer.textContent.includes(this.labels?.[0]?.textContent || this.id)) {
                         // This part can be complex; simpler to just let user re-calculate
                    }
                });
            }
        });
    }

    /**
     * Toggles display of pool-type specific options
     */
    function togglePoolTypeOptions() {
        const poolType = elements.poolType.value;
        
        elements.inflatableOptions.style.display = (poolType === 'inflatable') ? 'block' : 'none';
        elements.framedOptions.style.display = (poolType === 'framed') ? 'block' : 'none';
        
        // Reset ARIA for potentially hidden fields that were previously invalid
        if (poolType !== 'inflatable' && elements.inflationMethod) {
             elements.inflationMethod.classList.remove('invalid-input');
             elements.inflationMethod.setAttribute('aria-invalid', 'false');
        }
        if (poolType !== 'framed' && elements.frameComplexity) {
             elements.frameComplexity.classList.remove('invalid-input');
             elements.frameComplexity.setAttribute('aria-invalid', 'false');
        }
    }
    
    /**
     * Calculates the assembly time
     */
    function calculateAssemblyTime(poolType, poolSize, inflationMethod, frameComplexity, experienceLevel, helpers) {
        if (!BASE_SETUP_TIMES[poolType] || !BASE_SETUP_TIMES[poolType][poolSize]) {
            console.error("Invalid poolType or poolSize for BASE_SETUP_TIMES lookup.");
            return 0; // Or handle error appropriately
        }
        let baseTime = BASE_SETUP_TIMES[poolType][poolSize];
        
        if (poolType === 'inflatable' && INFLATION_MULTIPLIERS[inflationMethod]) {
            baseTime *= INFLATION_MULTIPLIERS[inflationMethod];
        }
        if (poolType === 'framed' && FRAME_COMPLEXITY_MULTIPLIERS[frameComplexity]) {
            baseTime *= FRAME_COMPLEXITY_MULTIPLIERS[frameComplexity];
        }
        if (EXPERIENCE_MULTIPLIERS[experienceLevel]) {
            baseTime *= EXPERIENCE_MULTIPLIERS[experienceLevel];
        }
        
        const helperReductionFactor = Math.min(helpers * HELPER_REDUCTION, MAX_HELPER_REDUCTION_EFFECT);
        baseTime *= (1 - helperReductionFactor);
        
        return Math.round(baseTime);
    }
    
    /**
     * Calculates the water filling time
     */
    function calculateWaterFillTime(poolSize, waterSource) {
        if (!APPROXIMATE_GALLONS[poolSize] || !WATER_FILL_TIMES[waterSource]) {
            console.error("Invalid poolSize or waterSource for water fill time lookup.");
            return 0;
        }
        const gallons = APPROXIMATE_GALLONS[poolSize];
        const fillTimePerHundredGallons = WATER_FILL_TIMES[waterSource];
        const fillTime = (gallons / 100) * fillTimePerHundredGallons;
        return Math.round(fillTime);
    }
    
    /**
     * Generates setup tips
     */
    function generateSetupTips(poolType, experienceLevel) {
        const baseTips = SETUP_TIPS[poolType] ? [...SETUP_TIPS[poolType]] : [];
        if (experienceLevel === 'first') {
            baseTips.unshift("Read the manufacturer's instructions completely before starting.");
            if (baseTips.length < MAX_TIPS_DISPLAY) { // Only add if space allows
                 baseTips.push("Take photos during disassembly of complex parts to help with future setup.");
            }
        }
        return baseTips.slice(0, MAX_TIPS_DISPLAY);
    }
    
    /**
     * Generates a list of tools needed
     */
    function generateToolsList(poolType) {
        const tools = TOOLS_NEEDED[poolType];
        return {
            basic: tools && tools.basic ? [...tools.basic] : [],
            optional: tools && tools.optional ? [...tools.optional] : []
        };
    }
    
    /**
     * Formats time in minutes to hours and minutes
     */
    function formatTime(minutes) {
        if (isNaN(minutes) || minutes < 0) return "N/A";
        if (minutes < 1) return "Less than 1 minute";
        if (minutes < 60) return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);
        
        let timeString = `${hours} hour${hours !== 1 ? 's' : ''}`;
        if (remainingMinutes > 0) {
            timeString += ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        }
        return timeString;
    }

    /**
     * Main function to calculate the estimated setup time
     */
    function calculateSetupTime() {
        if (!validateForm()) {
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        const poolType = elements.poolType.value;
        const poolSize = elements.poolSize.value;
        const inflationMethod = elements.inflationMethod.value;
        const frameComplexity = elements.frameComplexity.value;
        const experienceLevel = elements.experienceLevel.value;
        const helpers = parseInt(elements.helpers.value);
        const groundPrep = elements.groundPrep.value;
        const waterSource = elements.waterSource.value;
        
        const assemblyTime = calculateAssemblyTime(poolType, poolSize, inflationMethod, frameComplexity, experienceLevel, helpers);
        const groundPrepTime = GROUND_PREP_TIMES[groundPrep] || 0; // Fallback for safety
        const waterFillTime = calculateWaterFillTime(poolSize, waterSource);
        
        const totalTime = assemblyTime + groundPrepTime + waterFillTime;
        
        const setupTips = generateSetupTips(poolType, experienceLevel);
        const toolsNeeded = generateToolsList(poolType);
        
        displayResults(totalTime, assemblyTime, groundPrepTime, waterFillTime, setupTips, toolsNeeded);
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    /**
     * Displays the setup time results
     */
    function displayResults(totalTime, assemblyTime, groundPrepTime, waterFillTime, setupTips, toolsNeeded) {
        elements.totalTimeResult.innerHTML = `
            <p class="time-result">Approximately <strong>${formatTime(totalTime)}</strong></p>
            <p>This includes assembly/inflation, ground preparation, and water filling time.</p>
        `;
        
        elements.breakdownResult.innerHTML = `
            <ul>
                <li><strong>Assembly/Inflation:</strong> ${formatTime(assemblyTime)}</li>
                <li><strong>Ground Preparation:</strong> ${formatTime(groundPrepTime)}</li>
                <li><strong>Water Filling:</strong> ${formatTime(waterFillTime)}</li>
            </ul>
        `;
        
        elements.tipsResult.innerHTML = '<ul>';
        if (setupTips.length > 0) {
            setupTips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                elements.tipsResult.appendChild(li);
            });
        } else {
            elements.tipsResult.innerHTML = '<li>No specific tips generated for this combination.</li>';
        }
        elements.tipsResult.innerHTML += '</ul>';
        
        elements.toolsResult.innerHTML = `
            <p><strong>Basic Tools Needed:</strong></p>
            <ul>${toolsNeeded.basic.length > 0 ? toolsNeeded.basic.map(tool => `<li>${tool}</li>`).join('') : '<li>None specific</li>'}</ul>
            <p><strong>Optional Tools:</strong></p>
            <ul>${toolsNeeded.optional.length > 0 ? toolsNeeded.optional.map(tool => `<li>${tool}</li>`).join('') : '<li>None specific</li>'}</ul>
        `;
        elements.resultsSection.style.display = 'block';
    }

    /**
     * Initialize event listeners for the page
     */
    function initEventListeners() {
        elements.calculateButton.addEventListener('click', calculateSetupTime);
        elements.poolType.addEventListener('change', togglePoolTypeOptions);

        // Clear main error container on any form input change if errors were present
        // Individual field validation is handled by addValidationListeners for immediate feedback
        const allInteractiveElements = elements.form.querySelectorAll('input, select');
        allInteractiveElements.forEach(el => {
            el.addEventListener('change', () => { // Using 'change' is less noisy than 'input' for selects
                if (elements.errorContainer.style.display === 'block' && elements.errorContainer.innerHTML !== '') {
                    // Only clear if there are messages and user is interacting.
                    // Let validateForm rebuild errors if any still exist on next calculate.
                    // Or, if all fields linked to messages are now valid, clear. This is complex.
                    // For now, a simple approach: if user changes something, maybe they are fixing.
                    // The per-field validation will handle its own class/ARIA.
                }
            });
        });
        addValidationListeners(); // Set up per-field validation listeners
    }
    
    // Initialize the calculator
    elements.init(); // Initialize ARIA for error container
    initEventListeners(); 
    togglePoolTypeOptions(); // Set initial UI state for pool type options
});