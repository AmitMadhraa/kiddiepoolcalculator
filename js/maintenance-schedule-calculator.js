/**
 * Maintenance Schedule Calculator for Kiddie Pools
 * * This script generates a customized maintenance schedule for kiddie pools
 * based on pool characteristics, usage patterns, and environmental factors.
 */

// Maximum number of items to display in lists (efficiency tips, checklist)
const MAX_LIST_ITEMS = 10; // Used for efficiency tips, checklist items could be more flexible

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        // Form elements
        form: document.getElementById('maintenanceScheduleForm'),
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
        poolVolume: document.getElementById('poolVolume'),
        volumeUnit: document.getElementById('volumeUnit'),
        surfaceArea: document.getElementById('surfaceArea'),
        areaUnit: document.getElementById('areaUnit'),
        usageFrequency: document.getElementById('usageFrequency'),
        averageUsers: document.getElementById('averageUsers'),
        childrenUsers: document.getElementById('childrenUsers'), // Assuming 'yes'/'no' values
        climate: document.getElementById('climate'),
        sunExposure: document.getElementById('sunExposure'),
        surroundings: document.getElementById('surroundings'),
        covered: document.getElementById('covered'), // Assuming 'yes'/'no' values
        chemicalUse: document.getElementById('chemicalUse'),
        filterSystem: document.getElementById('filterSystem'),
        maintenanceTime: document.getElementById('maintenanceTime'), // Currently unused in core logic
        calculateButton: document.getElementById('calculateButton'),
        
        // Results elements
        results: document.getElementById('results'),
        summaryResult: document.getElementById('summaryResult'),
        dailyTasksList: document.getElementById('dailyTasksList'),
        weeklyTasksList: document.getElementById('weeklyTasksList'),
        biweeklyTasksList: document.getElementById('biweeklyTasksList'),
        monthlyTasksList: document.getElementById('monthlyTasksList'),
        seasonalTasksList: document.getElementById('seasonalTasksList'),
        waterChangeResult: document.getElementById('waterChangeResult'),
        chemicalResult: document.getElementById('chemicalResult'),
        printScheduleButton: document.getElementById('printScheduleButton'),
        downloadPdfButton: document.getElementById('downloadPdfButton')
    };
    
    // Constants for calculations
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const SQFT_TO_SQM = 0.092903;
    const SQM_TO_SQFT = 10.7639;
    
    // Water change frequency factors (in days)
    const WATER_CHANGE_FACTORS = {
        size: {
            tiny: { min: 1, max: 2 },      // < 50 gallons
            small: { min: 2, max: 5 },     // 50-150 gallons
            medium: { min: 4, max: 10 },   // 150-300 gallons
            large: { min: 7, max: 14 }     // > 300 gallons
        },
        chemical: { none: 0.5, minimal: 1.0, regular: 1.5, full: 2.0 },
        usage: { daily: 0.6, several: 0.8, weekly: 1.2, occasional: 1.5 },
        users: { few: 1.0, moderate: 0.8, many: 0.6 }, // few:1-2, mod:3-5, many:6+
        children: { yes: 0.7, no: 1.0 },
        climate: { hot: 0.7, moderate: 1.0, cool: 1.3 },
        sun: { full: 0.7, partial: 0.9, minimal: 1.1, shade: 1.3 },
        surroundings: { clean: 1.2, grass: 1.0, trees: 0.8, dusty: 0.7 },
        covered: { yes: 1.3, no: 1.0 }, // Assuming 'yes' means covered when not in use
        filter: { none: 0.8, basic: 1.2, standard: 1.5 }
    };
    
    // Task definitions for different maintenance schedules
    const MAINTENANCE_TASKS = {
        daily: {
            basic: ["Skim surface for debris and insects", "Cover pool when not in use", "Check water clarity and level"],
            chemical: ["Test water with test strips if using chemicals", "Check sanitizer levels"],
            filter: ["Run filtration system for recommended time", "Check filter for debris"]
        },
        weekly: {
            basic: ["Wipe down pool walls and floor", "Check for any damage or leaks", "Clean area around pool"],
            chemical: ["Adjust pH levels if using chemical treatment", "Add sanitizer as needed"],
            inflatable: ["Check air pressure and inflate if needed", "Inspect valves and seams"],
            filter: ["Clean or replace filter cartridge as needed", "Backwash filter if applicable"]
        },
        biweekly: {
            basic: ["Perform a deeper cleaning of pool surfaces", "Check for algae growth in corners and seams"],
            chemical: ["Shock treat the water if using chemicals", "Test total alkalinity and calcium hardness"],
            // Water change task will be added dynamically
        },
        monthly: {
            basic: ["Deep clean entire pool with appropriate cleaner", "Inspect all components thoroughly", "Clean or replace pool accessories"],
            chemical: ["Perform complete water testing", "Balance all water parameters"],
            maintenance: ["Check and clean pump basket if applicable", "Lubricate o-rings if needed"]
        },
        seasonal: {
            setup: ["Thoroughly clean pool before first use of season", "Check all components for winter damage", "Set up shade or protective measures"],
            closing: ["Drain and thoroughly clean pool", "Dry completely before storage", "Store in cool, dry place away from direct sunlight", "For inflatable pools: Ensure completely dry before folding", "For framed pools: Disassemble and clean all parts"]
        }
    };
    
    // Chemical treatment recommendations
    const CHEMICAL_RECOMMENDATIONS = {
        none: { basic: "No chemicals: Change water frequently (every 1-3 days depending on usage and conditions).", detailed: "Without chemicals, rely on frequent water changes and mechanical cleaning. Use a fine mesh net to skim debris daily and wipe surfaces during each water change." },
        minimal: { basic: "Minimal chemical treatment: Use a small amount of chlorine or non-chlorine sanitizer after each use or every 2-3 days.", detailed: "For minimal treatment, use 1-2 ppm chlorine or a non-chlorine alternative like bromine or hydrogen peroxide. Test water before each use." },
        regular: { basic: "Regular chemical treatment: Maintain 1-3 ppm chlorine and proper pH (7.2-7.6).", detailed: "For regular treatment, maintain chlorine at 1-3 ppm, pH between 7.2-7.6, and total alkalinity at 80-120 ppm. Test water 2-3 times per week." },
        full: { basic: "Full chemical treatment: Maintain proper sanitizer, pH, alkalinity, and use algaecide preventatively.", detailed: "For full treatment, maintain chlorine at 1-3 ppm, pH between 7.2-7.6, total alkalinity at 80-120 ppm, and calcium hardness at 150-250 ppm. Add algaecide weekly and shock treat bi-weekly." }
    };

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

        // Reset aria-invalid for all relevant inputs initially
        const inputsToReset = [
            elements.poolVolume, elements.surfaceArea, elements.averageUsers,
            elements.poolType, elements.usageFrequency, elements.childrenUsers,
            elements.climate, elements.sunExposure, elements.surroundings,
            elements.covered, elements.chemicalUse, elements.filterSystem
        ];
        inputsToReset.forEach(input => {
            if (input) { // Check if element exists
                 input.setAttribute('aria-invalid', 'false');
                 input.classList.remove('invalid-input');
            }
        });
        
        // Specific validations
        if (!validatePositiveNumber(elements.poolVolume)) {
            errorMessages.push("Pool Volume must be a positive number.");
            isValid = false;
        }
        // Surface area is optional, validate only if a value is entered and it's not valid
        if (elements.surfaceArea.value.trim() !== '' && !validateNonNegativeNumber(elements.surfaceArea)) {
            errorMessages.push("Surface Area must be a non-negative number if provided, or left empty/0.");
            isValid = false;
        }
        if (!validateRange(elements.averageUsers, 1, 20)) {
            errorMessages.push("Average Users must be between 1 and 20.");
            isValid = false;
        }

        // Validate select elements (assuming they are required if no "Select..." default option with empty value)
        const requiredSelects = [
            {el: elements.poolType, name: "Pool Type"},
            {el: elements.usageFrequency, name: "Usage Frequency"},
            {el: elements.childrenUsers, name: "Children Users Presence"},
            {el: elements.climate, name: "Climate"},
            {el: elements.sunExposure, name: "Sun Exposure"},
            {el: elements.surroundings, name: "Surroundings"},
            {el: elements.covered, name: "Pool Cover Usage"},
            {el: elements.chemicalUse, name: "Chemical Use Level"},
            {el: elements.filterSystem, name: "Filter System Type"}
        ];

        requiredSelects.forEach(item => {
            if (item.el && !item.el.value) { // Check if element exists and has no value
                errorMessages.push(`${item.name} selection is required.`);
                item.el.classList.add('invalid-input');
                item.el.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else if (item.el) {
                 item.el.classList.remove('invalid-input');
                 item.el.setAttribute('aria-invalid', 'false');
            }
        });
        
        displayErrorMessages(errorMessages);
        return isValid;
    }
    
    /**
     * Adds validation listeners to input fields for immediate feedback
     */
    function addValidationListeners() {
        elements.poolVolume.addEventListener('input', function() { validatePositiveNumber(this); });
        elements.volumeUnit.addEventListener('change', function() { validatePositiveNumber(elements.poolVolume); });
        
        elements.surfaceArea.addEventListener('input', function() { 
            // Only validate if not empty, otherwise it's fine
            if (this.value.trim() !== '') validateNonNegativeNumber(this); 
            else {
                this.classList.remove('invalid-input');
                this.setAttribute('aria-invalid', 'false');
            }
        });
        elements.areaUnit.addEventListener('change', function() { 
            if (elements.surfaceArea.value.trim() !== '') validateNonNegativeNumber(elements.surfaceArea);
            else {
                elements.surfaceArea.classList.remove('invalid-input');
                elements.surfaceArea.setAttribute('aria-invalid', 'false');
            }
        });
        
        elements.averageUsers.addEventListener('input', function() { validateRange(this, 1, 20); });

        // Add change listeners to selects to clear errors if user makes a selection
        const allSelects = [
            elements.poolType, elements.usageFrequency, elements.childrenUsers,
            elements.climate, elements.sunExposure, elements.surroundings,
            elements.covered, elements.chemicalUse, elements.filterSystem
        ];
        allSelects.forEach(select => {
            if (select) {
                select.addEventListener('change', function() {
                    if (this.value) {
                        this.classList.remove('invalid-input');
                        this.setAttribute('aria-invalid', 'false');
                    }
                    // Optionally, re-run full form validation silently to clear global error if this was the last one
                });
            }
        });
    }
    
    /**
     * Gets the pool volume in gallons regardless of input unit
     * @returns {number} - Pool volume in gallons or NaN if conversion fails
     */
    function getVolumeInGallons() {
        const volumeElement = elements.poolVolume;
        const unitElement = elements.volumeUnit;
        const value = parseFloat(volumeElement.value);
        const unit = unitElement.value;

        if (isNaN(value)) { // Should be caught by validateForm, but as a safeguard
            displayErrorMessages(["Pool Volume must be a valid number."]);
            return NaN;
        }

        switch (unit) {
            case 'gallons': return value;
            case 'liters': return value * LITERS_TO_GALLONS;
            default:
                console.error(`Unknown volume unit: ${unit}`);
                displayErrorMessages([`Error: Unknown volume unit '${unit}'. Please select a valid unit.`]);
                return NaN;
        }
    }
    
    /**
     * Gets the surface area in square feet regardless of input unit
     * Returns 0 if surface area is not provided or is zero.
     * Returns NaN if a value is provided but unit is unknown.
     * @returns {number} - Surface area in square feet, 0, or NaN
     */
    function getSurfaceAreaInSqFt() {
        const areaElement = elements.surfaceArea;
        const unitElement = elements.areaUnit;
        const valueStr = areaElement.value.trim();

        if (valueStr === '' || parseFloat(valueStr) === 0) {
            return 0; // Optional field, or legitimately 0
        }
        
        const value = parseFloat(valueStr);
        const unit = unitElement.value;

        if (isNaN(value)) { // Should be caught by validateForm
            displayErrorMessages(["Surface Area must be a valid number if provided."]);
            return NaN;
        }

        switch (unit) {
            case 'sqft': return value;
            case 'sqm': return value * SQM_TO_SQFT;
            default:
                console.error(`Unknown area unit: ${unit}`);
                displayErrorMessages([`Error: Unknown area unit '${unit}'. Please select a valid unit.`]);
                return NaN;
        }
    }

    /**
     * Calculates the recommended water change frequency
     */
    function calculateWaterChangeFrequency(poolVolume, usageFrequency, averageUsers, childrenUsers, climate, sunExposure, surroundings, covered, chemicalUse, filterSystem) {
        let baseFrequency;
        let poolSizeCategory; // To be used for conservation tips

        if (poolVolume < 50) { 
            baseFrequency = WATER_CHANGE_FACTORS.size.tiny; 
            poolSizeCategory = 'tiny';
        } else if (poolVolume < 150) { 
            baseFrequency = WATER_CHANGE_FACTORS.size.small; 
            poolSizeCategory = 'small';
        } else if (poolVolume < 300) { 
            baseFrequency = WATER_CHANGE_FACTORS.size.medium; 
            poolSizeCategory = 'medium';
        } else { 
            baseFrequency = WATER_CHANGE_FACTORS.size.large; 
            poolSizeCategory = 'large';
        }
        
        let userFactor;
        if (averageUsers <= 2) { userFactor = WATER_CHANGE_FACTORS.users.few; }
        else if (averageUsers <= 5) { userFactor = WATER_CHANGE_FACTORS.users.moderate; }
        else { userFactor = WATER_CHANGE_FACTORS.users.many; }
        
        const generalMultiplier = 
            WATER_CHANGE_FACTORS.chemical[chemicalUse] * WATER_CHANGE_FACTORS.usage[usageFrequency] * userFactor * WATER_CHANGE_FACTORS.children[childrenUsers] * WATER_CHANGE_FACTORS.climate[climate] * WATER_CHANGE_FACTORS.sun[sunExposure] * WATER_CHANGE_FACTORS.surroundings[surroundings] * WATER_CHANGE_FACTORS.covered[covered] * WATER_CHANGE_FACTORS.filter[filterSystem];

        const minFreq = Math.max(1, Math.round(baseFrequency.min * generalMultiplier));
        const maxFreq = Math.max(minFreq + 1, Math.round(baseFrequency.max * generalMultiplier)); // Ensure max is at least min+1
        
        return { min: minFreq, max: maxFreq, poolSizeCategory: poolSizeCategory };
    }
    
    /**
     * Generates maintenance tasks
     */
    function generateMaintenanceTasks(poolType, chemicalUse, filterSystem, waterChangeFrequency) {
        const tasks = {
            daily: [...MAINTENANCE_TASKS.daily.basic],
            weekly: [...MAINTENANCE_TASKS.weekly.basic],
            biweekly: [...MAINTENANCE_TASKS.biweekly.basic], // Start with basic biweekly
            monthly: [...MAINTENANCE_TASKS.monthly.basic],
            seasonal: [...MAINTENANCE_TASKS.seasonal.setup, ...MAINTENANCE_TASKS.seasonal.closing]
        };
        
        if (chemicalUse !== 'none') {
            tasks.daily.push(...MAINTENANCE_TASKS.daily.chemical);
            tasks.weekly.push(...MAINTENANCE_TASKS.weekly.chemical);
            if (MAINTENANCE_TASKS.biweekly.chemical) tasks.biweekly.push(...MAINTENANCE_TASKS.biweekly.chemical);
            tasks.monthly.push(...MAINTENANCE_TASKS.monthly.chemical);
        }
        
        if (filterSystem !== 'none') {
            tasks.daily.push(...MAINTENANCE_TASKS.daily.filter);
            tasks.weekly.push(...MAINTENANCE_TASKS.weekly.filter);
            if (MAINTENANCE_TASKS.monthly.maintenance) tasks.monthly.push(...MAINTENANCE_TASKS.monthly.maintenance);
        }
        
        if (poolType === 'inflatable') {
            tasks.weekly.push(...MAINTENANCE_TASKS.weekly.inflatable);
        }
        
        const waterChangeText = `Change water (or perform significant top-up) every ${waterChangeFrequency.min}-${waterChangeFrequency.max} days`;
        if (waterChangeFrequency.min <= 7) { tasks.weekly.push(waterChangeText); }
        else if (waterChangeFrequency.min <= 14) { tasks.biweekly.push(waterChangeText); }
        else { tasks.monthly.push(waterChangeText); }
        
        return tasks;
    }
    
    /**
     * Generates chemical treatment recommendations
     */
    function generateChemicalRecommendation(chemicalUse, poolVolume) {
        const recommendation = CHEMICAL_RECOMMENDATIONS[chemicalUse];
        let sizeSpecificDetails = '';
        if (poolVolume < 100) { sizeSpecificDetails = ' For small pools under 100 gallons, consider using approximately half the standard dose of chemicals, or follow product instructions for small volumes.'; }
        else if (poolVolume > 300) { sizeSpecificDetails = ' For larger pools over 300 gallons, follow standard dosing instructions on product labels carefully.'; }
        else { sizeSpecificDetails = ' For medium-sized pools (100-300 gallons), follow product label instructions for dosing precisely.';}
        
        return { basic: recommendation.basic, detailed: recommendation.detailed + sizeSpecificDetails };
    }

    /**
     * Generates HTML for the maintenance summary
     */
    function generateSummaryHTML(waterChangeFrequency, tasks) {
        let chemicalSummary = elements.chemicalUse.value === 'none' ? 
            'No chemical treatment - rely on frequent water changes.' : 
            'Maintain proper chemical balance with regular testing.';
        
        return `
            <p>Your kiddie pool requires approximately <strong>${tasks.daily.length} daily tasks</strong> and 
            <strong>${tasks.weekly.length} weekly tasks</strong> (excluding bi-weekly/monthly water changes if applicable).</p>
            <p>A crucial task is to change the water every 
            <strong>${waterChangeFrequency.min}-${waterChangeFrequency.max} days</strong>.</p>
            
            <p>Key maintenance points:</p>
            <ul>
                <li>Skim debris daily and cover when not in use.</li>
                <li>${chemicalSummary}</li>
                <li>Clean pool surfaces regularly, especially during water changes.</li>
                <li>Inspect pool and equipment regularly for damage or leaks.</li>
            </ul>
        `;
    }
    
    /**
     * Displays a list of tasks in a specified container
     */
    function displayTaskList(container, tasks) {
        container.innerHTML = '';
        if (!tasks || tasks.length === 0) { // Added check for undefined tasks
            const li = document.createElement('li');
            li.textContent = 'No specific tasks for this frequency based on your inputs.';
            container.appendChild(li);
            return;
        }
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task;
            container.appendChild(li);
        });
    }

    /**
     * Displays the maintenance schedule results
     */
    function displayResults(waterChangeFrequency, tasks, chemicalRecommendation) {
        elements.waterChangeResult.innerHTML = `
            <p>Based on your pool characteristics and usage patterns, you should change the water every 
            <strong>${waterChangeFrequency.min}-${waterChangeFrequency.max} days</strong>.</p>
        `;
        elements.chemicalResult.innerHTML = `
            <p><strong>${chemicalRecommendation.basic}</strong></p>
            <p>${chemicalRecommendation.detailed}</p>
        `;
        elements.summaryResult.innerHTML = generateSummaryHTML(waterChangeFrequency, tasks);
        
        displayTaskList(elements.dailyTasksList, tasks.daily);
        displayTaskList(elements.weeklyTasksList, tasks.weekly);
        displayTaskList(elements.biweeklyTasksList, tasks.biweekly);
        displayTaskList(elements.monthlyTasksList, tasks.monthly);
        displayTaskList(elements.seasonalTasksList, tasks.seasonal);

        elements.results.style.display = 'block';
    }

    /**
     * Main function to generate the schedule
     */
    function generateMaintenanceSchedule() {
        if (!validateForm()) {
            elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to errors
            return;
        }
        
        const poolType = elements.poolType.value;
        const poolVolume = getVolumeInGallons();
        const usageFrequency = elements.usageFrequency.value;
        const averageUsers = parseInt(elements.averageUsers.value);
        const childrenUsers = elements.childrenUsers.value; // 'yes' or 'no'
        const climate = elements.climate.value;
        const sunExposure = elements.sunExposure.value;
        const surroundings = elements.surroundings.value;
        const covered = elements.covered.value; // 'yes' or 'no'
        const chemicalUse = elements.chemicalUse.value;
        const filterSystem = elements.filterSystem.value;
        
        if (isNaN(poolVolume)) { // Halt if volume couldn't be determined
            elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return; 
        }
        // Surface area is optional and not directly used in core schedule logic for this version
        // const surfaceAreaSqFt = getSurfaceAreaInSqFt(); 
        // if (isNaN(surfaceAreaSqFt) && elements.surfaceArea.value.trim() !== '') { return; }

        const waterChangeFrequencyDetails = calculateWaterChangeFrequency(poolVolume, usageFrequency, averageUsers, childrenUsers, climate, sunExposure, surroundings, covered, chemicalUse, filterSystem);
        const tasks = generateMaintenanceTasks(poolType, chemicalUse, filterSystem, waterChangeFrequencyDetails);
        const chemicalRecommendation = generateChemicalRecommendation(chemicalUse, poolVolume);
        
        displayResults(waterChangeFrequencyDetails, tasks, chemicalRecommendation);
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to results
    }
    
    /**
     * Prints the maintenance schedule
     */
    function printSchedule() {
        window.print();
    }
    
    /**
     * Creates and downloads a PDF of the maintenance schedule
     */
    function downloadAsPdf() {
        alert("To save as PDF, please use your browser's print function (Ctrl+P or Cmd+P) and select 'Save as PDF' as the destination.");
        setTimeout(() => { window.print(); }, 500);
    }

    // Initialize elements and event listeners
    elements.init(); // Initialize ARIA for error container
    initEventListeners(); // Set up main calculate button listener & clear-on-change listeners
    addValidationListeners(); // Set up per-field validation listeners
    
    function initEventListeners() {
        elements.calculateButton.addEventListener('click', generateMaintenanceSchedule);
        elements.printScheduleButton.addEventListener('click', printSchedule);
        elements.downloadPdfButton.addEventListener('click', downloadAsPdf);

        // Generic clear error on input change
        const allInputsAndSelects = [
            elements.poolVolume, elements.volumeUnit, elements.surfaceArea, elements.areaUnit,
            elements.averageUsers, elements.poolType, elements.usageFrequency, elements.childrenUsers,
            elements.climate, elements.sunExposure, elements.surroundings, elements.covered,
            elements.chemicalUse, elements.filterSystem
        ];
        allInputsAndSelects.forEach(el => {
            if(el) {
                el.addEventListener('change', () => { // Use change for selects, works for inputs too
                    if (elements.errorContainer.innerHTML !== '') { // Only clear if there were messages
                        displayErrorMessages([]); // Clear messages
                    }
                    // Individual input validation is handled by addValidationListeners on 'input'
                });
            }
        });
    }
});