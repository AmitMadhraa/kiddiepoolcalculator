/**
 * Kiddie Pool Cost Calculator
 * 
 * This script calculates the total cost of owning and maintaining a kiddie pool
 * based on initial purchase, operational, and maintenance costs.
 * 
 * Features:
 * - Calculates first year, annual recurring, and lifetime costs
 * - Provides detailed cost breakdowns by category
 * - Offers cost-saving recommendations based on user inputs
 * - Calculates cost per use for value assessment
 */

// Maximum number of cost-saving tips to display
const MAX_TIPS = 10;

document.addEventListener('DOMContentLoaded', function() {
    // Cache all DOM elements for consistent access
    const elements = {
        // Form elements
        form: document.getElementById('costForm'),
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
        poolCost: document.getElementById('poolCost'),
        accessoriesCost: document.getElementById('accessoriesCost'),
        equipmentCost: document.getElementById('equipmentCost'),
        waterVolume: document.getElementById('waterVolume'),
        waterVolumeUnit: document.getElementById('waterVolumeUnit'),
        waterRate: document.getElementById('waterRate'),
        waterChanges: document.getElementById('waterChanges'),
        electricityUsage: document.getElementById('electricityUsage'),
        electricityRate: document.getElementById('electricityRate'),
        usageDays: document.getElementById('usageDays'),
        chemicalsCost: document.getElementById('chemicalsCost'),
        cleaningSuppliesCost: document.getElementById('cleaningSuppliesCost'),
        repairCost: document.getElementById('repairCost'),
        seasonLength: document.getElementById('seasonLength'),
        poolLifespan: document.getElementById('poolLifespan'),
        
        // Result display elements
        firstYearCost: document.getElementById('firstYearCost'),
        annualCost: document.getElementById('annualCost'),
        lifetimeCost: document.getElementById('lifetimeCost'),
        costPerUse: document.getElementById('costPerUse'),
        costBreakdown: document.getElementById('costBreakdown'),
        costSavingTips: document.getElementById('costSavingTips'),
        detailedBreakdown: document.getElementById('detailedBreakdown').querySelector('tbody')
    };
    
    // Pool type suggestions for auto-fill
    const poolTypeSuggestions = {
        'inflatable-basic': {
            cost: 30,
            accessories: 20,
            equipment: 0,
            lifespan: 2
        },
        'inflatable-premium': {
            cost: 80,
            accessories: 40,
            equipment: 50,
            lifespan: 3
        },
        'hard-plastic': {
            cost: 60,
            accessories: 25,
            equipment: 0,
            lifespan: 4
        },
        'framed-small': {
            cost: 150,
            accessories: 50,
            equipment: 100,
            lifespan: 5
        },
        'framed-medium': {
            cost: 250,
            accessories: 75,
            equipment: 150,
            lifespan: 6
        },
        'framed-large': {
            cost: 350,
            accessories: 100,
            equipment: 200,
            lifespan: 7
        }
    };
    
    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Calculate button click event
        elements.calculateButton.addEventListener('click', function() {
            if (validateForm()) {
                const formData = getFormData();
                const results = calculateCosts(formData);
                displayResults(results);
                scrollToResults();
            }
        });
        
        // Pool type change event for auto-fill suggestions
        elements.poolType.addEventListener('change', function() {
            const poolType = this.value;
            if (poolTypeSuggestions[poolType]) {
                // Only suggest values if fields are empty or 0
                if (!elements.poolCost.value || parseFloat(elements.poolCost.value) === 0) {
                    elements.poolCost.value = poolTypeSuggestions[poolType].cost;
                }
                
                if (!elements.accessoriesCost.value || parseFloat(elements.accessoriesCost.value) === 0) {
                    elements.accessoriesCost.value = poolTypeSuggestions[poolType].accessories;
                }
                
                if (!elements.equipmentCost.value || parseFloat(elements.equipmentCost.value) === 0) {
                    elements.equipmentCost.value = poolTypeSuggestions[poolType].equipment;
                }
                
                if (!elements.poolLifespan.value || parseFloat(elements.poolLifespan.value) === 0) {
                    elements.poolLifespan.value = poolTypeSuggestions[poolType].lifespan;
                }
            }
        });
        
        // Form input validation on change
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', function() {
                // Clear error styling when user corrects input
                this.classList.remove('error');
                this.setAttribute('aria-invalid', 'false');
                elements.errorContainer.innerHTML = '';
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
        // Validate non-negative numeric inputs
        const nonNegativeInputs = [
            elements.poolCost,
            elements.accessoriesCost,
            elements.equipmentCost,
            elements.waterRate,
            elements.waterChanges,
            elements.electricityUsage,
            elements.electricityRate,
            elements.chemicalsCost,
            elements.cleaningSuppliesCost,
            elements.repairCost,
            elements.seasonLength
        ];
        
        // Validate positive numeric inputs (must be > 0)
        const positiveInputs = [
            elements.waterVolume,
            elements.usageDays,
            elements.poolLifespan
        ];
        
        nonNegativeInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', function() {
                    validateNonNegativeNumber(this);
                });
            }
        });
        
        positiveInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', function() {
                    validatePositiveNumber(this);
                });
            }
        });
    }
    
    /**
     * Validates that an input contains a non-negative number
     * @param {HTMLInputElement} input - The input element to validate
     * @returns {boolean} - Whether the input is valid
     */
    function validateNonNegativeNumber(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value >= 0;
        
        if (isValid) {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    /**
     * Validates that an input contains a positive number (greater than zero)
     * @param {HTMLInputElement} input - The input element to validate
     * @returns {boolean} - Whether the input is valid
     */
    function validatePositiveNumber(input) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value > 0;
        
        if (isValid) {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
        
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
        if (!elements.poolType.value) {
            elements.poolType.classList.add('error');
            elements.poolType.setAttribute('aria-invalid', 'true');
            errorMessages.push('Please select a pool type');
            isValid = false;
        }
        
        // Check pool cost
        if (!elements.poolCost.value || isNaN(parseFloat(elements.poolCost.value)) || parseFloat(elements.poolCost.value) < 0) {
            elements.poolCost.classList.add('error');
            elements.poolCost.setAttribute('aria-invalid', 'true');
            errorMessages.push('Pool cost must be a non-negative number');
            isValid = false;
        }
        
        // Check accessories cost
        if (!elements.accessoriesCost.value || isNaN(parseFloat(elements.accessoriesCost.value)) || parseFloat(elements.accessoriesCost.value) < 0) {
            elements.accessoriesCost.classList.add('error');
            elements.accessoriesCost.setAttribute('aria-invalid', 'true');
            errorMessages.push('Accessories cost must be a non-negative number');
            isValid = false;
        }
        
        // Check water volume
        if (!elements.waterVolume.value || isNaN(parseFloat(elements.waterVolume.value)) || parseFloat(elements.waterVolume.value) <= 0) {
            elements.waterVolume.classList.add('error');
            elements.waterVolume.setAttribute('aria-invalid', 'true');
            errorMessages.push('Water volume must be a positive number');
            isValid = false;
        }
        
        // Check water changes
        if (!elements.waterChanges.value || isNaN(parseInt(elements.waterChanges.value)) || parseInt(elements.waterChanges.value) < 0) {
            elements.waterChanges.classList.add('error');
            elements.waterChanges.setAttribute('aria-invalid', 'true');
            errorMessages.push('Water changes must be a non-negative number');
            isValid = false;
        }
        
        // Check usage days
        if (!elements.usageDays.value || isNaN(parseInt(elements.usageDays.value)) || parseInt(elements.usageDays.value) <= 0) {
            elements.usageDays.classList.add('error');
            elements.usageDays.setAttribute('aria-invalid', 'true');
            errorMessages.push('Usage days must be a positive number');
            isValid = false;
        }
        
        // Check pool lifespan
        if (!elements.poolLifespan.value || isNaN(parseInt(elements.poolLifespan.value)) || parseInt(elements.poolLifespan.value) <= 0) {
            elements.poolLifespan.classList.add('error');
            elements.poolLifespan.setAttribute('aria-invalid', 'true');
            errorMessages.push('Pool lifespan must be a positive number');
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
            // Initial costs
            poolType: elements.poolType.value,
            poolCost: parseFloat(elements.poolCost.value),
            accessoriesCost: parseFloat(elements.accessoriesCost.value),
            equipmentCost: parseFloat(elements.equipmentCost.value),
            
            // Operational costs
            waterVolume: parseFloat(elements.waterVolume.value),
            waterVolumeUnit: elements.waterVolumeUnit.value,
            waterRate: parseFloat(elements.waterRate.value),
            waterChanges: parseInt(elements.waterChanges.value),
            electricityUsage: parseFloat(elements.electricityUsage.value),
            electricityRate: parseFloat(elements.electricityRate.value),
            usageDays: parseInt(elements.usageDays.value),
            
            // Maintenance costs
            chemicalsCost: parseFloat(elements.chemicalsCost.value),
            cleaningSuppliesCost: parseFloat(elements.cleaningSuppliesCost.value),
            repairCost: parseFloat(elements.repairCost.value),
            seasonLength: parseInt(elements.seasonLength.value),
            poolLifespan: parseInt(elements.poolLifespan.value)
        };
        
        return formData;
    }
    
    /**
     * Calculate costs based on form data
     * @param {Object} formData - Form data object
     * @returns {Object} - Calculation results
     */
    function calculateCosts(formData) {
        // Convert water volume to gallons if needed
        let waterVolumeGallons = formData.waterVolume;
        if (formData.waterVolumeUnit === 'liters') {
            waterVolumeGallons = formData.waterVolume * 0.264172; // Convert liters to gallons
        }
        
        // Calculate initial costs
        const initialCosts = {
            pool: formData.poolCost,
            accessories: formData.accessoriesCost,
            equipment: formData.equipmentCost
        };
        
        const totalInitialCost = initialCosts.pool + initialCosts.accessories + initialCosts.equipment;
        
        // Calculate annual water costs
        const waterCostPerFill = (waterVolumeGallons / 1000) * formData.waterRate;
        const annualWaterCost = waterCostPerFill * formData.waterChanges;
        
        // Calculate annual electricity costs
        const dailyElectricityCost = formData.electricityUsage * formData.electricityRate;
        const annualElectricityCost = dailyElectricityCost * formData.usageDays;
        
        // Calculate annual maintenance costs
        const annualChemicalsCost = formData.chemicalsCost * formData.seasonLength;
        const annualCleaningCost = formData.cleaningSuppliesCost;
        const annualRepairCost = formData.repairCost;
        
        // Calculate total annual operational and maintenance costs
        const annualOperationalCosts = {
            water: annualWaterCost,
            electricity: annualElectricityCost,
            chemicals: annualChemicalsCost,
            cleaning: annualCleaningCost,
            repair: annualRepairCost
        };
        
        const totalAnnualCost = annualWaterCost + annualElectricityCost + 
                               annualChemicalsCost + annualCleaningCost + annualRepairCost;
        
        // Calculate first year cost (initial + annual)
        const firstYearCost = totalInitialCost + totalAnnualCost;
        
        // Calculate lifetime cost
        const lifetimeCost = totalInitialCost + (totalAnnualCost * formData.poolLifespan);
        
        // Calculate cost per use
        const usesPerLifetime = formData.usageDays * formData.poolLifespan;
        const costPerUse = lifetimeCost / usesPerLifetime;
        
        // Generate cost-saving tips
        const costSavingTips = generateCostSavingTips(formData, annualOperationalCosts);
        
        return {
            initialCosts: initialCosts,
            annualOperationalCosts: annualOperationalCosts,
            totalInitialCost: totalInitialCost,
            totalAnnualCost: totalAnnualCost,
            firstYearCost: firstYearCost,
            lifetimeCost: lifetimeCost,
            costPerUse: costPerUse,
            costSavingTips: costSavingTips
        };
    }
    
    /**
     * Generate cost-saving tips based on form data and calculated costs
     * @param {Object} formData - Form data object
     * @param {Object} operationalCosts - Calculated operational costs
     * @returns {Array} - Array of cost-saving tips
     */
    function generateCostSavingTips(formData, operationalCosts) {
        const tips = [];
        
        // Find the highest operational cost
        const costCategories = Object.entries(operationalCosts).sort((a, b) => b[1] - a[1]);
        const highestCostCategory = costCategories[0][0];
        
        // Add tips based on the highest cost category
        switch (highestCostCategory) {
            case 'water':
                tips.push("Reduce water costs by using a pool cover to minimize evaporation and extend time between water changes.");
                tips.push("Consider collecting rainwater (where legal) to use for pool filling.");
                if (formData.waterChanges > 3) {
                    tips.push("Instead of complete water changes, consider partial water changes combined with proper chemical treatment to extend water life.");
                }
                break;
                
            case 'electricity':
                tips.push("Reduce electricity costs by using a timer for your pump to run only when needed (typically 4-6 hours per day).");
                tips.push("Consider solar alternatives for heating, such as solar covers or solar rings.");
                tips.push("Run electrical equipment during off-peak hours if your utility offers time-of-use rates.");
                break;
                
            case 'chemicals':
                tips.push("Reduce chemical costs by keeping the pool covered when not in use to prevent debris and sunlight from affecting water chemistry.");
                tips.push("Buy chemicals in bulk during off-season sales for significant savings.");
                tips.push("Test water regularly to avoid over-treatment with chemicals.");
                break;
                
            case 'cleaning':
                tips.push("Invest in a good quality pool cover to reduce cleaning frequency and supply costs.");
                tips.push("Create a DIY pool skimmer using household items instead of purchasing specialized equipment.");
                break;
                
            case 'repair':
                tips.push("Invest in a higher quality pool initially to reduce repair costs over time.");
                tips.push("Store your pool properly during off-season to prevent damage and extend lifespan.");
                tips.push("Address small repairs immediately before they become major issues.");
                break;
        }
        
        // Add general cost-saving tips
        if (formData.poolLifespan < 3) {
            tips.push("Consider investing in a more durable pool. While the initial cost is higher, the longer lifespan reduces annual costs significantly.");
        }
        
        if (formData.usageDays < 30) {
            tips.push("Increase pool usage days to improve cost-effectiveness. Your current cost per use is relatively high due to limited usage.");
        }
        
        // Ensure we have at least 3 tips
        if (tips.length < 3) {
            tips.push("Properly winterize your pool during off-season to prevent damage and extend its lifespan.");
            tips.push("Share maintenance supplies with neighbors or family members who also have pools to split costs.");
        }
        
        // Return at most MAX_TIPS tips
        return tips.slice(0, MAX_TIPS);
    }
    
    /**
     * Format currency value
     * @param {number} value - Value to format
     * @returns {string} - Formatted currency string
     */
    function formatCurrency(value) {
        return '$' + value.toFixed(2);
    }
        /**
     * Display results
     * @param {Object} results - Calculation results
     */
    function displayResults(results) {
        // Display summary results
        elements.firstYearCost.textContent = formatCurrency(results.firstYearCost);
        elements.annualCost.textContent = formatCurrency(results.totalAnnualCost);
        elements.lifetimeCost.textContent = formatCurrency(results.lifetimeCost);
        elements.costPerUse.textContent = formatCurrency(results.costPerUse);
        
        // Display cost breakdown chart
        createCostBreakdownChart(results);
        
        // Display detailed breakdown table
        displayDetailedBreakdown(results);
        
        // Display cost-saving tips
        elements.costSavingTips.innerHTML = '';
        results.costSavingTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            elements.costSavingTips.appendChild(li);
        });
        
        // Show results section
        elements.resultsSection.style.display = 'block';
    }
    
    /**
     * Create cost breakdown chart
     * @param {Object} results - Calculation results
     */
    function createCostBreakdownChart(results) {
        // Clear previous chart
        elements.costBreakdown.innerHTML = '';
        
        // Create categories for the chart
        const categories = [
            { name: 'Initial Costs', value: results.totalInitialCost },
            { name: 'Water', value: results.annualOperationalCosts.water },
            { name: 'Electricity', value: results.annualOperationalCosts.electricity },
            { name: 'Chemicals', value: results.annualOperationalCosts.chemicals },
            { name: 'Cleaning', value: results.annualOperationalCosts.cleaning },
            { name: 'Repairs', value: results.annualOperationalCosts.repair }
        ];
        
        // Find the maximum value for scaling
        const maxValue = Math.max(...categories.map(cat => cat.value));
        
        // Create the chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'bar-chart';
        
        // Create bars for each category
        categories.forEach(category => {
            if (category.value > 0) {
                const barContainer = document.createElement('div');
                barContainer.className = 'bar-container';
                
                const barLabel = document.createElement('div');
                barLabel.className = 'bar-label';
                barLabel.textContent = category.name;
                
                const barWrapper = document.createElement('div');
                barWrapper.className = 'bar-wrapper';
                
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.width = `${(category.value / maxValue) * 100}%`;
                
                const barValue = document.createElement('div');
                barValue.className = 'bar-value';
                barValue.textContent = formatCurrency(category.value);
                
                barWrapper.appendChild(bar);
                barWrapper.appendChild(barValue);
                
                barContainer.appendChild(barLabel);
                barContainer.appendChild(barWrapper);
                
                chartContainer.appendChild(barContainer);
            }
        });
        
        // Append chart container to breakdown element
        elements.costBreakdown.appendChild(chartContainer);
    }

/**
 * Display detailed breakdown table
 * @param {Object} results - Calculation results
 */
function displayDetailedBreakdown(results) {
    // Clear previous table rows
    elements.detailedBreakdown.innerHTML = '';
    
    // Create rows for initial costs
    createTableRow('Pool Purchase', formatCurrency(results.initialCosts.pool));
    createTableRow('Accessories', formatCurrency(results.initialCosts.accessories));
    createTableRow('Equipment', formatCurrency(results.initialCosts.equipment));
    createTableRow('Total Initial Costs', formatCurrency(results.totalInitialCost), true);
    
    // Create rows for operational costs
    createTableRow('Water (per season)', formatCurrency(results.annualOperationalCosts.water));
    createTableRow('Electricity (per season)', formatCurrency(results.annualOperationalCosts.electricity));
    createTableRow('Chemicals (per season)', formatCurrency(results.annualOperationalCosts.chemicals));
    createTableRow('Cleaning Supplies (per season)', formatCurrency(results.annualOperationalCosts.cleaning));
    createTableRow('Repairs (per season)', formatCurrency(results.annualOperationalCosts.repair));
    createTableRow('Total Operational Costs (per season)', formatCurrency(results.totalAnnualCost), true);
    
    // Create rows for summary costs
    createTableRow('First Year Total', formatCurrency(results.firstYearCost), true);
    createTableRow('Annual Recurring Cost', formatCurrency(results.totalAnnualCost), true);
    createTableRow('Lifetime Cost', formatCurrency(results.lifetimeCost), true);
    createTableRow('Cost Per Use', formatCurrency(results.costPerUse), true);
    
    /**
     * Helper function to create a table row
     * @param {string} label - Row label
     * @param {string} value - Row value
     * @param {boolean} isHighlighted - Whether to highlight the row
     */
    function createTableRow(label, value, isHighlighted = false) {
        const row = document.createElement('tr');
        if (isHighlighted) {
            row.className = 'highlighted';
        }
        
        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        valueCell.className = 'text-right';
        
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        
        elements.detailedBreakdown.appendChild(row);
    }
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
