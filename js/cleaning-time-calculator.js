/**
 * Kiddie Pool Cleaning Time Calculator
 * 
 * This script calculates how long it will take to clean a kiddie pool
 * based on pool characteristics, current condition, cleaning methods,
 * and additional factors.
 * 
 * Features:
 * - Estimates total cleaning time
 * - Provides time breakdown for different cleaning tasks
 * - Offers efficiency tips based on user inputs
 * - Recommends optimal cleaning schedule
 * - Generates a customized cleaning checklist
 */

// Maximum number of items to display in lists (efficiency tips, checklist)
const MAX_LIST_ITEMS = 10;

document.addEventListener('DOMContentLoaded', function() {
    // Cache all DOM elements for consistent access
    const elements = {
        // Form elements
        form: document.getElementById('cleaningTimeForm'),
        calculateButton: document.getElementById('calculateButton'),
        resultsSection: document.getElementById('results'),
        errorContainer: document.getElementById('errorContainer'),
        
        // Initialize accessibility attributes
        init: function() {
            if (this.errorContainer) {
                this.errorContainer.setAttribute('role', 'alert');
                this.errorContainer.setAttribute('aria-live', 'assertive');
            }
            return this;
        },
        
        // Input elements
        poolType: document.getElementById('poolType'),
        poolSize: document.getElementById('poolSize'),
        surfaceType: document.getElementById('surfaceType'),
        cleanlinessLevel: document.getElementById('cleanlinessLevel'),
        debrisType: document.getElementById('debrisType'),
        lastCleaning: document.getElementById('lastCleaning'),
        drainMethod: document.getElementById('drainMethod'),
        cleaningProducts: document.getElementById('cleaningProducts'),
        helperCount: document.getElementById('helperCount'),
        experienceLevel: document.getElementById('experienceLevel'),
        weatherConditions: document.getElementById('weatherConditions'),
        
        // Result display elements
        totalCleaningTime: document.getElementById('totalCleaningTime'),
        timeBreakdown: document.getElementById('timeBreakdown'),
        efficiencyTips: document.getElementById('efficiencyTips'),
        cleaningSchedule: document.getElementById('cleaningSchedule'),
        cleaningChecklist: document.getElementById('cleaningChecklist')
    };
    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Calculate button click event
        elements.calculateButton.addEventListener('click', function() {
            if (validateForm()) {
                const formData = getFormData();
                const results = calculateCleaningTime(formData);
                displayResults(results);
                scrollToResults();
            }
        });
        
        // Form input validation on change
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', function() {
                // Clear error styling when user corrects input
                this.classList.remove('error');
                this.setAttribute('aria-invalid', 'false');
                elements.errorContainer.textContent = '';
                elements.errorContainer.style.display = 'none';
            });
        });
        
        // Add specific validation listeners
        addValidationListeners();
    }
    
    /**
     * Add validation listeners to specific inputs
     */
    function addValidationListeners() {
        // Pool size validation
        elements.poolSize.addEventListener('input', function() {
            validateSelect(this, 'Please select a pool size');
        });
        
        // Cleanliness level validation
        elements.cleanlinessLevel.addEventListener('input', function() {
            validateSelect(this, 'Please select a cleanliness level');
        });
        
        // Drain method validation
        elements.drainMethod.addEventListener('input', function() {
            validateSelect(this, 'Please select a drain method');
        });
        
        // Helper count validation
        elements.helperCount.addEventListener('input', function() {
            validateSelect(this, 'Please select the number of helpers');
        });
        
        // Cleaning tools validation
        elements.form.querySelectorAll('input[name="cleaningTools"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                validateCleaningTools();
            });
        });
    }
    
    /**
     * Validate a select element
     * @param {HTMLSelectElement} select - The select element to validate
     * @param {string} errorMessage - The error message to display if invalid
     * @returns {boolean} - Whether the select is valid
     */
    function validateSelect(select, errorMessage) {
        const isValid = select.value !== '';
        
        if (!isValid) {
            select.classList.add('error');
            select.setAttribute('aria-invalid', 'true');
        } else {
            select.classList.remove('error');
            select.setAttribute('aria-invalid', 'false');
        }
        
        return isValid;
    }
    
    /**
     * Validate that at least one cleaning tool is selected
     * @returns {boolean} - Whether at least one tool is selected
     */
    function validateCleaningTools() {
        const cleaningToolsChecked = elements.form.querySelectorAll('input[name="cleaningTools"]:checked');
        const isValid = cleaningToolsChecked.length > 0;
        
        elements.form.querySelectorAll('input[name="cleaningTools"]').forEach(checkbox => {
            if (!isValid) {
                checkbox.parentElement.classList.add('error');
                checkbox.setAttribute('aria-invalid', 'true');
            } else {
                checkbox.parentElement.classList.remove('error');
                checkbox.setAttribute('aria-invalid', 'false');
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate form inputs
     * @returns {boolean} - Whether the form is valid
     */
    function validateForm() {
        let isValid = true;
        const errorMessages = [];
        elements.errorContainer.innerHTML = '';
        elements.errorContainer.style.display = 'none';
        
        // Reset error styling
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        });
        
        // Check required selects
        if (!validateSelect(elements.poolSize, '')) {
            errorMessages.push('Please select a pool size');
            isValid = false;
        }
        
        if (!validateSelect(elements.cleanlinessLevel, '')) {
            errorMessages.push('Please select a cleanliness level');
            isValid = false;
        }
        
        if (!validateSelect(elements.drainMethod, '')) {
            errorMessages.push('Please select a drain method');
            isValid = false;
        }
        
        if (!validateSelect(elements.helperCount, '')) {
            errorMessages.push('Please select the number of helpers');
            isValid = false;
        }
        
        // Ensure at least one cleaning tool is selected
        if (!validateCleaningTools()) {
            errorMessages.push('Please select at least one cleaning tool');
            isValid = false;
        }
        
        // Display error messages if validation fails
        if (!isValid) {
            // Create a list of error messages
            const ul = document.createElement('ul');
            ul.style.margin = '5px 0';
            ul.style.paddingLeft = '20px';
            
            errorMessages.forEach(message => {
                const li = document.createElement('li');
                li.textContent = message;
                ul.appendChild(li);
            });
            
            elements.errorContainer.appendChild(ul);
            elements.errorContainer.style.display = 'block';
        }
        
        return isValid;
    }
    
    /**
     * Get form data as an object
     * @returns {Object} - Form data object
     */
    function getFormData() {
        const formData = {
            poolType: elements.poolType.value,
            poolSize: elements.poolSize.value,
            surfaceType: elements.surfaceType.value,
            cleanlinessLevel: elements.cleanlinessLevel.value,
            debrisType: elements.debrisType.value,
            lastCleaning: elements.lastCleaning.value,
            drainMethod: elements.drainMethod.value,
            cleaningProducts: elements.cleaningProducts.value,
            helperCount: elements.helperCount.value,
            experienceLevel: elements.experienceLevel.value,
            weatherConditions: elements.weatherConditions.value,
            cleaningTools: []
        };
        
        // Get selected cleaning tools
        elements.form.querySelectorAll('input[name="cleaningTools"]:checked').forEach(checkbox => {
            formData.cleaningTools.push(checkbox.value);
        });
        
        return formData;
    }
    
    /**
     * Calculate cleaning time based on form data
     * @param {Object} formData - Form data object
     * @returns {Object} - Calculation results
     */
    function calculateCleaningTime(formData) {
        // Initialize time components in minutes
        const timeComponents = {
            draining: calculateDrainingTime(formData),
            debris: calculateDebrisRemovalTime(formData),
            scrubbing: calculateScrubbingTime(formData),
            rinsing: calculateRinsingTime(formData),
            drying: calculateDryingTime(formData),
            setup: calculateSetupTime(formData)
        };
        
        // Calculate total time
        const totalMinutes = Object.values(timeComponents).reduce((sum, time) => sum + time, 0);
        
        // Apply efficiency factors
        const adjustedTotalMinutes = applyEfficiencyFactors(totalMinutes, formData);
        
        // Format time for display
        const formattedTime = formatTime(adjustedTotalMinutes);
        
        // Generate efficiency tips
        const efficiencyTips = generateEfficiencyTips(formData, timeComponents);
        
        // Generate recommended cleaning schedule
        const cleaningSchedule = generateCleaningSchedule(formData);
        
        // Generate cleaning checklist
        const cleaningChecklist = generateCleaningChecklist(formData);
        
        return {
            totalTime: formattedTime,
            timeComponents: timeComponents,
            efficiencyTips: efficiencyTips,
            cleaningSchedule: cleaningSchedule,
            cleaningChecklist: cleaningChecklist
        };
    }
    
    /**
     * Calculate time to drain the pool
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateDrainingTime(formData) {
        // Base draining times in minutes by pool size
        const baseDrainTimes = {
            'small': {
                'drain-plug': 5,
                'submersible-pump': 2,
                'siphon': 7,
                'manual-bailing': 15,
                'no-drain': 0
            },
            'medium': {
                'drain-plug': 12,
                'submersible-pump': 5,
                'siphon': 15,
                'manual-bailing': 30,
                'no-drain': 0
            },
            'large': {
                'drain-plug': 20,
                'submersible-pump': 10,
                'siphon': 25,
                'manual-bailing': 45,
                'no-drain': 0
            }
        };
        
        // Get base time from lookup table
        let drainTime = baseDrainTimes[formData.poolSize][formData.drainMethod];
        
        // Adjust for cleanliness level (dirtier water drains slower)
        const cleanlinessMultiplier = {
            'light': 1,
            'moderate': 1.1,
            'heavy': 1.2,
            'severe': 1.3
        };
        
        drainTime *= cleanlinessMultiplier[formData.cleanlinessLevel];
        
        return drainTime;
    }
    
    /**
     * Calculate time to remove debris
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateDebrisRemovalTime(formData) {
        // Base debris removal times in minutes by cleanliness level
        const baseDebrisTimes = {
            'light': 3,
            'moderate': 7,
            'heavy': 12,
            'severe': 20
        };
        
        // Get base time from lookup table
        let debrisTime = baseDebrisTimes[formData.cleanlinessLevel];
        
        // Adjust for debris type
        const debrisMultiplier = {
            'leaves': 1.2,  // Leaves take longer to remove
            'dirt': 0.9,    // Dirt often comes out with water
            'sunscreen': 1.1, // Oily residue takes more effort
            'algae': 1.3,   // Algae is stubborn
            'mixed': 1.15   // Mixed debris is average difficulty
        };
        
        debrisTime *= debrisMultiplier[formData.debrisType];
        
        // Adjust for pool size
        const sizeMultiplier = {
            'small': 0.8,
            'medium': 1,
            'large': 1.5
        };
        
        debrisTime *= sizeMultiplier[formData.poolSize];
        
        // Adjust for tools (skimmer makes it faster)
        if (formData.cleaningTools.includes('skimmer')) {
            debrisTime *= 0.7;
        }
        
        return debrisTime;
    }
    
    /**
     * Calculate time to scrub the pool
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateScrubbingTime(formData) {
        // Base scrubbing times in minutes by pool size
        const baseScrubbingTimes = {
            'small': 10,
            'medium': 20,
            'large': 35
        };
        
        // Get base time from lookup table
        let scrubbingTime = baseScrubbingTimes[formData.poolSize];
        
        // Adjust for cleanliness level
        const cleanlinessMultiplier = {
            'light': 0.7,
            'moderate': 1,
            'heavy': 1.5,
            'severe': 2.2
        };
        
        scrubbingTime *= cleanlinessMultiplier[formData.cleanlinessLevel];
        
        // Adjust for surface type
        const surfaceMultiplier = {
            'smooth-vinyl': 0.8,
            'textured-vinyl': 1.2,
            'plastic': 1,
            'pvc': 0.9
        };
        
        scrubbingTime *= surfaceMultiplier[formData.surfaceType];
        
        // Adjust for debris type
        const debrisMultiplier = {
            'leaves': 0.9,
            'dirt': 1.1,
            'sunscreen': 1.3,
            'algae': 1.5,
            'mixed': 1.2
        };
        
        scrubbingTime *= debrisMultiplier[formData.debrisType];
        
        // Adjust for cleaning products
        const productMultiplier = {
            'water-only': 1.3,
            'mild-soap': 1,
            'vinegar': 0.9,
            'pool-cleaner': 0.8,
            'bleach-solution': 0.85
        };
        
        scrubbingTime *= productMultiplier[formData.cleaningProducts];
        
        // Adjust for tools
        if (formData.cleaningTools.includes('brush')) {
            scrubbingTime *= 0.8;
        }
        
        if (formData.cleaningTools.includes('pressure-washer')) {
            scrubbingTime *= 0.5;
        }
        
        if (formData.cleaningTools.includes('sponge')) {
            scrubbingTime *= 0.9;
        }
        
        return scrubbingTime;
    }
    
    /**
     * Calculate time to rinse the pool
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateRinsingTime(formData) {
        // Base rinsing times in minutes by pool size
        const baseRinsingTimes = {
            'small': 3,
            'medium': 6,
            'large': 10
        };
        
        // Get base time from lookup table
        let rinsingTime = baseRinsingTimes[formData.poolSize];
        
        // Adjust for cleaning products (some require more thorough rinsing)
        const productMultiplier = {
            'water-only': 0.7,
            'mild-soap': 1,
            'vinegar': 1.1,
            'pool-cleaner': 1.2,
            'bleach-solution': 1.5
        };
        
        rinsingTime *= productMultiplier[formData.cleaningProducts];
        
        // Adjust for surface type
        const surfaceMultiplier = {
            'smooth-vinyl': 0.9,
            'textured-vinyl': 1.2,
            'plastic': 1,
            'pvc': 0.9
        };
        
        rinsingTime *= surfaceMultiplier[formData.surfaceType];
        
        return rinsingTime;
    }
    
    /**
     * Calculate time to dry the pool
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateDryingTime(formData) {
        // This is active drying time (not passive air drying)
        // Base drying times in minutes by pool size
        const baseDryingTimes = {
            'small': 2,
            'medium': 4,
            'large': 7
        };
        
        // Get base time from lookup table
        let dryingTime = baseDryingTimes[formData.poolSize];
        
        // Adjust for weather conditions
        const weatherMultiplier = {
            'sunny-warm': 0.8,
            'cloudy': 1,
            'windy': 0.9,
            'cold': 1.2,
            'indoor': 1.3
        };
        
        dryingTime *= weatherMultiplier[formData.weatherConditions];
        
        // Adjust for surface type
        const surfaceMultiplier = {
            'smooth-vinyl': 0.9,
            'textured-vinyl': 1.3,
            'plastic': 1,
            'pvc': 0.9
        };
        
        dryingTime *= surfaceMultiplier[formData.surfaceType];
        
        return dryingTime;
    }
    
    /**
     * Calculate setup and preparation time
     * @param {Object} formData - Form data object
     * @returns {number} - Time in minutes
     */
    function calculateSetupTime(formData) {
        // Base setup times in minutes
        let setupTime = 5;  // Gathering supplies, preparation
        
        // Adjust for experience level
        const experienceMultiplier = {
            'beginner': 1.5,
            'intermediate': 1,
            'experienced': 0.7
        };
        
        setupTime *= experienceMultiplier[formData.experienceLevel];
        
        // Add time for complex cleaning methods
        if (formData.cleaningTools.includes('vacuum')) {
            setupTime += 3;  // Setting up vacuum
        }
        
        if (formData.cleaningTools.includes('pressure-washer')) {
            setupTime += 5;  // Setting up pressure washer
        }
        
        return setupTime;
    }
    
    /**
     * Apply efficiency factors to total time
     * @param {number} totalMinutes - Total time in minutes
     * @param {Object} formData - Form data object
     * @returns {number} - Adjusted time in minutes
     */
    function applyEfficiencyFactors(totalMinutes, formData) {
        let adjustedTime = totalMinutes;
        
        // Adjust for number of helpers
        const helperMultiplier = {
            '1': 1,
            '2': 0.65,  // Two people are more than twice as efficient
            '3': 0.45,  // Diminishing returns with more people
            '4+': 0.35  // Even more diminishing returns
        };
        
        adjustedTime *= helperMultiplier[formData.helperCount];
        
        // Adjust for experience level
        const experienceMultiplier = {
            'beginner': 1.3,
            'intermediate': 1,
            'experienced': 0.8
        };
        
        adjustedTime *= experienceMultiplier[formData.experienceLevel];
        
        // Adjust for weather conditions
        const weatherMultiplier = {
            'sunny-warm': 0.9,  // Pleasant working conditions
            'cloudy': 1,
            'windy': 1.1,  // Wind can make things more difficult
            'cold': 1.2,  // Cold slows down work
            'indoor': 0.95  // Controlled environment
        };
        
        adjustedTime *= weatherMultiplier[formData.weatherConditions];
        
        return adjustedTime;
    }
    
    /**
     * Format time in minutes to hours and minutes
     * @param {number} minutes - Time in minutes
     * @returns {string} - Formatted time string
     */
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        
        if (hours === 0) {
            return `${mins} minutes`;
        } else if (hours === 1 && mins === 0) {
            return '1 hour';
        } else if (mins === 0) {
            return `${hours} hours`;
        } else if (hours === 1) {
            return `1 hour ${mins} minutes`;
        } else {
            return `${hours} hours ${mins} minutes`;
        }
    }
    
    /**
     * Generate efficiency tips based on form data and time components
     * @param {Object} formData - Form data object
     * @param {Object} timeComponents - Time components object
     * @returns {Array} - Array of efficiency tips
     */
    function generateEfficiencyTips(formData, timeComponents) {
        const tips = [];
        
        // Find the most time-consuming component
        const maxComponent = Object.entries(timeComponents).reduce((max, [key, value]) => 
            value > max.value ? {key, value} : max, {key: '', value: 0});
        
        // Add tips based on the most time-consuming component
        switch (maxComponent.key) {
            case 'draining':
                tips.push("Consider investing in a submersible pump to significantly reduce draining time.");
                if (formData.drainMethod === 'manual-bailing') {
                    tips.push("Manual bailing is very time-consuming. A simple siphon with a garden hose is much faster.");
                }
                break;
                
            case 'debris':
                tips.push("Remove large debris before draining to prevent clogging and make the process faster.");
                if (!formData.cleaningTools.includes('skimmer')) {
                    tips.push("A pool skimmer net can reduce debris removal time by up to 30%.");
                }
                break;
                
            case 'scrubbing':
                if (formData.cleanlinessLevel === 'severe' || formData.cleanlinessLevel === 'heavy') {
                    tips.push("For heavily soiled pools, apply cleaning solution and let it sit for 5-10 minutes before scrubbing to reduce effort.");
                }
                if (!formData.cleaningTools.includes('brush')) {
                    tips.push("A proper pool brush with medium bristles can make scrubbing much more efficient.");
                }
                if (formData.debrisType === 'algae' && formData.cleaningProducts !== 'bleach-solution') {
                    tips.push("For algae removal, a diluted bleach solution is most effective when used safely.");
                }
                break;
        }
        
        // General efficiency tips
        if (formData.helperCount === '1') {
            tips.push("Cleaning with a partner can reduce total cleaning time by about 35%.");
        }
        
        if (formData.experienceLevel === 'beginner') {
            tips.push("Create a cleaning checklist to follow each time. Your efficiency will improve with practice.");
        }
        
        if (formData.lastCleaning === 'over-week' || formData.lastCleaning === 'never') {
            tips.push("Clean your pool more frequently to prevent heavy buildup, which takes much longer to remove.");
        }
        
        if (!formData.cleaningTools.includes('pressure-washer') && formData.poolSize === 'large') {
            tips.push("For large pools, a pressure washer (on low setting) can reduce scrubbing time by up to 50%.");
        }
        
        // Add tips about cleaning products
        if (formData.cleaningProducts === 'water-only' && 
            (formData.cleanlinessLevel === 'heavy' || formData.cleanlinessLevel === 'severe')) {
            tips.push("Water alone is insufficient for heavy cleaning. Consider using a mild soap or specialized pool cleaner.");
        }
        
        // Ensure we have at least 3 tips
        if (tips.length < 3) {
            tips.push("Organize your cleaning supplies in a caddy or bucket for easy access during the cleaning process.");
            tips.push("Clean your pool at the warmest, driest time of day for faster drying and more pleasant working conditions.");
        }
        
        // Return at most MAX_LIST_ITEMS tips
        return tips.slice(0, MAX_LIST_ITEMS);
    }
    
    /**
     * Generate recommended cleaning schedule based on form data
     * @param {Object} formData - Form data object
     * @returns {string} - Recommended cleaning schedule
     */
    function generateCleaningSchedule(formData) {
        let schedule = "";
        
        // Determine base cleaning frequency
        let frequency = "";
        
        // Factor in pool size, usage patterns, and environmental factors
        switch (formData.poolSize) {
            case 'small':
                frequency = "Drain and clean after each use, or every 2-3 days if used regularly.";
                break;
            case 'medium':
                frequency = "Clean thoroughly every 3-5 days during regular use.";
                break;
            case 'large':
                frequency = "Clean thoroughly every 5-7 days during regular use.";
                break;
        }
        
        // Adjust based on current cleanliness and last cleaning
        if (formData.cleanlinessLevel === 'severe' || formData.cleanlinessLevel === 'heavy') {
            schedule = `<p>Based on the current condition of your pool, we recommend an immediate thorough cleaning, followed by a more frequent maintenance schedule:</p>
                       <p><strong>Recommended Schedule:</strong> ${frequency}</p>
                       <p><strong>Quick Maintenance:</strong> Skim debris daily and check water clarity.</p>
                       <p><strong>Water Treatment:</strong> If you use chemicals, check levels every 2-3 days.</p>`;
        } else {
            schedule = `<p><strong>Recommended Schedule:</strong> ${frequency}</p>
                       <p><strong>Quick Maintenance:</strong> Skim debris daily and check water clarity.</p>
                       <p><strong>Water Treatment:</strong> If you use chemicals, check levels every 2-3 days.</p>
                       <p><strong>Seasonal Consideration:</strong> During periods of heavy use or hot weather, increase cleaning frequency by 30-50%.</p>`;
        }
        
        return schedule;
    }
    
    /**
     * Generate cleaning checklist based on form data
     * @param {Object} formData - Form data object
     * @returns {Array} - Array of checklist items
     */
    function generateCleaningChecklist(formData) {
        const checklist = [];
        
        // Add general checklist items
        checklist.push("Gather cleaning supplies and equipment.");
        checklist.push("Remove large debris from the pool surface.");
        checklist.push("Drain the pool (if necessary).");
        checklist.push("Scrub the pool walls and floor.");
        checklist.push("Rinse the pool thoroughly.");
        checklist.push("Dry the pool and surrounding area.");
        
        // Add pool-type specific steps
        if (formData.poolType === 'inflatable') {
            checklist.push("Check for leaks or damage while cleaning");
        } else if (formData.poolType === 'framed') {
            checklist.push("Inspect frame components for rust or damage");
        }
        
        // Limit the number of checklist items to MAX_LIST_ITEMS
        return checklist.slice(0, MAX_LIST_ITEMS);
    }
    
    /**
     * Display calculation results
     * @param {Object} results - Calculation results
     */
    function displayResults(results) {
        // Show results section
        elements.resultsSection.style.display = 'block';
        
        // Display total cleaning time
        elements.totalCleaningTime.textContent = results.totalTime;
        
        // Display time breakdown
        elements.timeBreakdown.innerHTML = '';
        for (const [task, minutes] of Object.entries(results.timeComponents)) {
            if (minutes > 0) {
                const li = document.createElement('li');
                const taskName = task.charAt(0).toUpperCase() + task.slice(1);
                li.textContent = `${taskName}: ${formatTime(minutes)}`;
                elements.timeBreakdown.appendChild(li);
            }
        }
        
        // Display efficiency tips
        elements.efficiencyTips.innerHTML = '';
        results.efficiencyTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            elements.efficiencyTips.appendChild(li);
        });
        
        // Display cleaning schedule
        elements.cleaningSchedule.innerHTML = results.cleaningSchedule;
        
        // Display cleaning checklist
        elements.cleaningChecklist.innerHTML = '';
        results.cleaningChecklist.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            elements.cleaningChecklist.appendChild(li);
        });
    }
    
    /**
     * Scroll to results section
     */
    function scrollToResults() {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Initialize the calculator
    elements.init();
    initEventListeners();
});
