/**
 * Kiddie Pool Water Heating Cost Calculator
 * 
 * This script handles the functionality for calculating the estimated
 * cost of heating water in a kiddie pool using various heating methods.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants for calculations and conversions
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const FAHRENHEIT_TO_CELSIUS = (f) => (f - 32) * (5/9);
    const CELSIUS_TO_FAHRENHEIT = (c) => (c * (9/5)) + 32;
    
    // Constants for energy calculations
    const BTU_PER_GALLON_PER_DEGREE_F = 8.34; // BTUs needed to raise 1 gallon of water by 1°F
    const KWH_PER_BTU = 0.000293071; // Conversion from BTU to kWh
    const THERM_PER_BTU = 0.00001; // Conversion from BTU to therms
    const PROPANE_BTU_PER_GALLON = 91500; // BTUs per gallon of propane
    
    // Constants for heating time calculations
    const ELECTRIC_HEATER_BTU_PER_HOUR = 5000; // Average small electric heater BTU output
    const GAS_HEATER_BTU_PER_HOUR = 8000; // Average small gas heater BTU output
    const HEAT_PUMP_BTU_PER_HOUR = 4000; // Average small heat pump BTU output (this is the actual heat delivered)
    const SOLAR_HEATER_BTU_PER_HOUR = 2000; // Average small solar heater BTU output
    
    // Heat loss factors (percentage of heat lost per hour)
    const HEAT_LOSS_FACTORS = {
        'low': 0.05, // 5% heat loss per hour (indoor or well-insulated)
        'medium': 0.10, // 10% heat loss per hour (outdoor with cover)
        'high': 0.20 // 20% heat loss per hour (outdoor without cover)
    };
    
    // Temperature validation ranges
    const TEMP_RANGES = {
        celsius: { min: 0, max: 45 },
        fahrenheit: { min: 32, max: 110 }
    };
    
    // Cache all DOM elements
    const elements = {
        // Form container and error display
        form: document.getElementById('heatingCostCalculatorForm'),
        calculateButton: document.getElementById('calculateButton'),
        
        // Pool information inputs
        poolInfo: {
            volume: document.getElementById('poolVolume'),
            volumeUnit: document.getElementById('volumeUnit'),
            currentTemp: document.getElementById('currentTemp'),
            tempUnit: document.getElementById('tempUnit'),
            desiredTemp: document.getElementById('desiredTemp'),
            desiredTempUnit: document.getElementById('desiredTempUnit')
        },
        
        // Heating method selection
        heatingMethod: document.getElementById('heatingMethod'),
        
        // Heating method field containers
        methodFields: {
            electric: document.getElementById('electricFields'),
            gasNatural: document.getElementById('gasNaturalFields'),
            gasPropane: document.getElementById('gasPropaneFields'),
            heatPump: document.getElementById('heatPumpFields'),
            solar: document.getElementById('solarFields')
        },
        
        // Electric heater inputs
        electric: {
            rate: document.getElementById('electricityRate'),
            efficiency: document.getElementById('heaterEfficiency')
        },
        
        // Natural gas heater inputs
        gasNatural: {
            rate: document.getElementById('naturalGasRate'),
            efficiency: document.getElementById('gasHeaterEfficiency')
        },
        
        // Propane gas heater inputs
        gasPropane: {
            rate: document.getElementById('propaneRate'),
            efficiency: document.getElementById('propaneHeaterEfficiency')
        },
        
        // Heat pump inputs
        heatPump: {
            rate: document.getElementById('heatPumpElectricityRate'),
            cop: document.getElementById('heatPumpCOP')
        },
        
        // Solar heater inputs
        solar: {
            pumpRate: document.getElementById('solarPumpElectricityRate'),
            pumpWattage: document.getElementById('solarPumpWattage')
        },
        
        // Environmental inputs
        environmental: {
            ambientTemp: document.getElementById('ambientTemp'),
            ambientTempUnit: document.getElementById('ambientTempUnit'),
            heatLossRate: document.getElementById('heatLossRate')
        },
        
        // Results elements
        results: {
            container: document.getElementById('results'),
            initialCost: document.getElementById('initialCostResult'),
            energyRequired: document.getElementById('energyRequiredResult'),
            heatingTime: document.getElementById('heatingTimeResult'),
            maintenanceCost: document.getElementById('maintenanceCostResult'),
            weeklyMaintenanceCost: document.getElementById('weeklyMaintenanceCostResult'),
            comparisonChart: document.getElementById('costComparisonChart')
        }
    };
    
    // Create error container with accessibility attributes
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'assertive');
    elements.form.prepend(errorContainer);
    
    // Add event listeners
    elements.heatingMethod.addEventListener('change', toggleHeatingMethodFields);
    elements.calculateButton.addEventListener('click', validateAndCalculate);
    
    // Add validation listeners to all inputs
    addValidationListeners();
    
    // Initialize the form
    toggleHeatingMethodFields();
    
    /**
     * Adds validation listeners to all numeric input fields
     */
    function addValidationListeners() {
        // Pool information inputs
        elements.poolInfo.volume.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.poolInfo.currentTemp.addEventListener('input', function() {
            validateTemperature(this, elements.poolInfo.tempUnit);
        });
        
        elements.poolInfo.desiredTemp.addEventListener('input', function() {
            validateTemperature(this, elements.poolInfo.desiredTempUnit);
        });
        
        // Temperature unit changes trigger validation
        elements.poolInfo.tempUnit.addEventListener('change', function() {
            validateTemperature(elements.poolInfo.currentTemp, this);
        });
        
        elements.poolInfo.desiredTempUnit.addEventListener('change', function() {
            validateTemperature(elements.poolInfo.desiredTemp, this);
        });
        
        // Electric heater inputs
        elements.electric.rate.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.electric.efficiency.addEventListener('input', function() {
            validateRange(this, 1, 100);
        });
        
        // Natural gas heater inputs
        elements.gasNatural.rate.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.gasNatural.efficiency.addEventListener('input', function() {
            validateRange(this, 1, 100);
        });
        
        // Propane gas heater inputs
        elements.gasPropane.rate.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.gasPropane.efficiency.addEventListener('input', function() {
            validateRange(this, 1, 100);
        });
        
        // Heat pump inputs
        elements.heatPump.rate.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.heatPump.cop.addEventListener('input', function() {
            validateRange(this, 1, 10);
        });
        
        // Solar heater inputs
        elements.solar.pumpRate.addEventListener('input', function() {
            validateNonNegativeNumber(this);
        });
        
        elements.solar.pumpWattage.addEventListener('input', function() {
            validateNonNegativeNumber(this);
        });
        
        // Environmental inputs
        elements.environmental.ambientTemp.addEventListener('input', function() {
            validateTemperature(this, elements.environmental.ambientTempUnit);
        });
        
        elements.environmental.ambientTempUnit.addEventListener('change', function() {
            validateTemperature(elements.environmental.ambientTemp, this);
        });
    }
    
    /**
     * Toggles the visibility of heating method fields based on selected method
     */
    function toggleHeatingMethodFields() {
        const selectedMethod = elements.heatingMethod.value;
        
        // Hide all method fields first
        for (const key in elements.methodFields) {
            if (elements.methodFields[key]) {
                elements.methodFields[key].classList.add('hidden');
            }
        }
        
        // Show the appropriate fields based on selection
        switch (selectedMethod) {
            case 'electric':
                elements.methodFields.electric.classList.remove('hidden');
                break;
            case 'gas-natural':
                elements.methodFields.gasNatural.classList.remove('hidden');
                break;
            case 'gas-propane':
                elements.methodFields.gasPropane.classList.remove('hidden');
                break;
            case 'heat-pump':
                elements.methodFields.heatPump.classList.remove('hidden');
                break;
            case 'solar':
                elements.methodFields.solar.classList.remove('hidden');
                break;
        }
    }
    
    /**
     * Validates inputs and then calculates heating cost if valid
     */
    function validateAndCalculate() {
        // Hide any previous error messages
        hideErrorMessage();
        
        // Hide previous results
        elements.results.container.classList.remove('active');
        
        let isValid = true;
        
        // Validate pool volume
        if (!validatePositiveNumber(elements.poolInfo.volume)) {
            isValid = false;
            showErrorMessage('Please enter a valid pool volume greater than zero.');
            elements.poolInfo.volume.focus();
            return;
        }
        
        // Validate temperatures
        if (!validateTemperature(elements.poolInfo.currentTemp, elements.poolInfo.tempUnit)) {
            isValid = false;
            showErrorMessage('Please enter a valid current water temperature.');
            elements.poolInfo.currentTemp.focus();
            return;
        }
        
        if (!validateTemperature(elements.poolInfo.desiredTemp, elements.poolInfo.desiredTempUnit)) {
            isValid = false;
            showErrorMessage('Please enter a valid desired water temperature.');
            elements.poolInfo.desiredTemp.focus();
            return;
        }
        
        // Validate that desired temp is higher than current temp
        const currentTempF = elements.poolInfo.tempUnit.value === 'celsius' 
            ? CELSIUS_TO_FAHRENHEIT(parseFloat(elements.poolInfo.currentTemp.value)) 
            : parseFloat(elements.poolInfo.currentTemp.value);
            
        const desiredTempF = elements.poolInfo.desiredTempUnit.value === 'celsius' 
            ? CELSIUS_TO_FAHRENHEIT(parseFloat(elements.poolInfo.desiredTemp.value)) 
            : parseFloat(elements.poolInfo.desiredTemp.value);
            
        if (desiredTempF <= currentTempF) {
            isValid = false;
            showErrorMessage('Desired temperature must be higher than current temperature.');
            elements.poolInfo.desiredTemp.focus();
            return;
        }
        
        // Validate ambient temperature
        if (!validateTemperature(elements.environmental.ambientTemp, elements.environmental.ambientTempUnit)) {
            isValid = false;
            showErrorMessage('Please enter a valid ambient air temperature.');
            elements.environmental.ambientTemp.focus();
            return;
        }
        
        // Validate method-specific inputs
        const selectedMethod = elements.heatingMethod.value;
        
        switch (selectedMethod) {
            case 'electric':
                if (!validatePositiveNumber(elements.electric.rate)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid electricity rate.');
                    elements.electric.rate.focus();
                    return;
                }
                
                if (!validateRange(elements.electric.efficiency, 1, 100)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid heater efficiency (1-100%).');
                    elements.electric.efficiency.focus();
                    return;
                }
                break;
                
            case 'gas-natural':
                if (!validatePositiveNumber(elements.gasNatural.rate)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid natural gas rate.');
                    elements.gasNatural.rate.focus();
                    return;
                }
                
                if (!validateRange(elements.gasNatural.efficiency, 1, 100)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid heater efficiency (1-100%).');
                    elements.gasNatural.efficiency.focus();
                    return;
                }
                break;
                
            case 'gas-propane':
                if (!validatePositiveNumber(elements.gasPropane.rate)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid propane rate.');
                    elements.gasPropane.rate.focus();
                    return;
                }
                
                if (!validateRange(elements.gasPropane.efficiency, 1, 100)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid heater efficiency (1-100%).');
                    elements.gasPropane.efficiency.focus();
                    return;
                }
                break;
                
            case 'heat-pump':
                if (!validatePositiveNumber(elements.heatPump.rate)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid electricity rate.');
                    elements.heatPump.rate.focus();
                    return;
                }
                
                if (!validateRange(elements.heatPump.cop, 1, 10)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid heat pump COP (1-10).');
                    elements.heatPump.cop.focus();
                    return;
                }
                break;
                
            case 'solar':
                if (!validateNonNegativeNumber(elements.solar.pumpRate)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid electricity rate (0 or greater).');
                    elements.solar.pumpRate.focus();
                    return;
                }
                
                if (!validateNonNegativeNumber(elements.solar.pumpWattage)) {
                    isValid = false;
                    showErrorMessage('Please enter a valid pump wattage (0 or greater).');
                    elements.solar.pumpWattage.focus();
                    return;
                }
                break;
        }
        
        // If all inputs are valid, calculate the heating cost
        if (isValid) {
            calculateHeatingCost();
        }
    }
    
    /**
     * Validates a positive number input
     * @param {HTMLInputElement} input - The input element to validate
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
     * Validates a non-negative number input
     * @param {HTMLInputElement} input - The input element to validate
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
     * Validates a number within a specified range
     * @param {HTMLInputElement} input - The input element to validate
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
     * Calculates the cost of heating the pool water
     */
    function calculateHeatingCost() {
        // Get pool volume in gallons
        const poolVolume = getVolumeInGallons();
        
        // Get temperature values in Fahrenheit
        const currentTempF = getTemperatureInFahrenheit(elements.poolInfo.currentTemp, elements.poolInfo.tempUnit);
        const desiredTempF = getTemperatureInFahrenheit(elements.poolInfo.desiredTemp, elements.poolInfo.desiredTempUnit);
        const ambientTempF = getTemperatureInFahrenheit(elements.environmental.ambientTemp, elements.environmental.ambientTempUnit);
        
        // Calculate temperature difference
        const tempDifferenceF = desiredTempF - currentTempF;
        
        // Calculate BTUs required to heat the water
        const btuRequired = poolVolume * tempDifferenceF * BTU_PER_GALLON_PER_DEGREE_F;
        
        // Calculate energy required and cost based on heating method
        const selectedMethod = elements.heatingMethod.value;
        let initialCost = 0;
        let energyRequired = '';
        let heatingTime = 0;
        let maintenanceCost = 0;
        
        switch (selectedMethod) {
            case 'electric':
                // Get electric heater inputs
                const electricityRate = parseFloat(elements.electric.rate.value);
                const heaterEfficiency = parseFloat(elements.electric.efficiency.value) / 100;
                
                // Calculate energy in kWh
                const kwhRequired = (btuRequired / heaterEfficiency) * KWH_PER_BTU;
                
                // Calculate cost
                initialCost = kwhRequired * electricityRate;
                
                // Calculate heating time (hours)
                heatingTime = btuRequired / (ELECTRIC_HEATER_BTU_PER_HOUR * heaterEfficiency);
                
                // Set energy required text
                energyRequired = `${kwhRequired.toFixed(2)} kWh`;
                
                // Calculate daily maintenance cost
                maintenanceCost = calculateMaintenanceCost(poolVolume, desiredTempF, ambientTempF, 'electric', electricityRate, heaterEfficiency);
                break;
                
            case 'gas-natural':
                // Get natural gas heater inputs
                const naturalGasRate = parseFloat(elements.gasNatural.rate.value);
                const gasHeaterEfficiency = parseFloat(elements.gasNatural.efficiency.value) / 100;
                
                // Calculate energy in therms
                const thermsRequired = (btuRequired / gasHeaterEfficiency) * THERM_PER_BTU;
                
                // Calculate cost
                initialCost = thermsRequired * naturalGasRate;
                
                // Calculate heating time (hours)
                heatingTime = btuRequired / (GAS_HEATER_BTU_PER_HOUR * gasHeaterEfficiency);
                
                // Set energy required text
                energyRequired = `${thermsRequired.toFixed(2)} therms`;
                
                // Calculate daily maintenance cost
                maintenanceCost = calculateMaintenanceCost(poolVolume, desiredTempF, ambientTempF, 'gas-natural', naturalGasRate, gasHeaterEfficiency);
                break;
                
            case 'gas-propane':
                // Get propane gas heater inputs
                const propaneRate = parseFloat(elements.gasPropane.rate.value);
                const propaneHeaterEfficiency = parseFloat(elements.gasPropane.efficiency.value) / 100;
                
                // Calculate energy in gallons of propane
                const propaneGallonsRequired = (btuRequired / propaneHeaterEfficiency) / PROPANE_BTU_PER_GALLON;
                
                // Calculate cost
                initialCost = propaneGallonsRequired * propaneRate;
                
                // Calculate heating time (hours)
                heatingTime = btuRequired / (GAS_HEATER_BTU_PER_HOUR * propaneHeaterEfficiency);
                
                // Set energy required text
                energyRequired = `${propaneGallonsRequired.toFixed(2)} gallons of propane`;
                
                // Calculate daily maintenance cost
                maintenanceCost = calculateMaintenanceCost(poolVolume, desiredTempF, ambientTempF, 'gas-propane', propaneRate, propaneHeaterEfficiency);
                break;
                
            case 'heat-pump':
                // Get heat pump inputs
                const heatPumpElectricityRate = parseFloat(elements.heatPump.rate.value);
                const heatPumpCOP = parseFloat(elements.heatPump.cop.value);
                
                // Calculate energy in kWh (COP improves efficiency)
                const heatPumpKwhRequired = (btuRequired / heatPumpCOP) * KWH_PER_BTU;
                
                // Calculate cost
                initialCost = heatPumpKwhRequired * heatPumpElectricityRate;
                
                // Calculate heating time (hours)
                // Note: HEAT_PUMP_BTU_PER_HOUR is the actual heat output, so we don't multiply by COP here
                heatingTime = btuRequired / HEAT_PUMP_BTU_PER_HOUR;
                
                // Set energy required text
                energyRequired = `${heatPumpKwhRequired.toFixed(2)} kWh`;
                
                // Calculate daily maintenance cost
                maintenanceCost = calculateMaintenanceCost(poolVolume, desiredTempF, ambientTempF, 'heat-pump', heatPumpElectricityRate, heatPumpCOP);
                break;
                
            case 'solar':
                // Get solar heater inputs
                const solarPumpElectricityRate = parseFloat(elements.solar.pumpRate.value) || 0;
                const solarPumpWattage = parseFloat(elements.solar.pumpWattage.value) || 0;
                
                // Solar heating is free except for pump electricity
                const pumpHours = btuRequired / SOLAR_HEATER_BTU_PER_HOUR;
                const pumpKwh = (solarPumpWattage / 1000) * pumpHours;
                
                // Calculate cost (just pump electricity)
                initialCost = pumpKwh * solarPumpElectricityRate;
                
                // Calculate heating time (hours)
                heatingTime = btuRequired / SOLAR_HEATER_BTU_PER_HOUR;
                
                // Set energy required text
                energyRequired = `${btuRequired.toFixed(0)} BTU (Solar)`;
                
                // Calculate daily maintenance cost
                maintenanceCost = calculateMaintenanceCost(poolVolume, desiredTempF, ambientTempF, 'solar', solarPumpElectricityRate, 1, solarPumpWattage);
                break;
        }
        
        // Calculate weekly maintenance cost
        const weeklyMaintenanceCost = maintenanceCost * 7;
        
        // Update results
        elements.results.initialCost.textContent = `$${initialCost.toFixed(2)}`;
        elements.results.energyRequired.textContent = energyRequired;
        elements.results.heatingTime.textContent = formatTime(heatingTime);
        elements.results.maintenanceCost.textContent = `$${maintenanceCost.toFixed(2)} per day`;
        elements.results.weeklyMaintenanceCost.textContent = `$${weeklyMaintenanceCost.toFixed(2)} per week`;
        
        // Update comparison chart
        updateCostComparisonChart(poolVolume, currentTempF, desiredTempF, ambientTempF);
        
        // Show results
        elements.results.container.classList.add('active');
        elements.results.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Calculates the daily maintenance cost to maintain water temperature
     * @param {number} poolVolume - Pool volume in gallons
     * @param {number} waterTempF - Water temperature in Fahrenheit
     * @param {number} ambientTempF - Ambient air temperature in Fahrenheit
     * @param {string} heatingMethod - The heating method used
     * @param {number} energyRate - The cost of energy ($/kWh, $/therm, etc.)
     * @param {number} efficiency - The efficiency factor of the heater
     * @param {number} pumpWattage - The wattage of the pump (for solar only)
     * @returns {number} - The daily maintenance cost
     */
    function calculateMaintenanceCost(poolVolume, waterTempF, ambientTempF, heatingMethod, energyRate, efficiency, pumpWattage = 0) {
        // Get heat loss factor based on selected rate
        const heatLossFactor = HEAT_LOSS_FACTORS[elements.environmental.heatLossRate.value];
        
        // Calculate temperature difference between water and ambient air
        const tempDifference = Math.max(0, waterTempF - ambientTempF);
        
        // Calculate BTUs lost per day (higher difference = more heat loss)
        // This is a simplified model for small pools
        const btuLostPerDay = poolVolume * tempDifference * BTU_PER_GALLON_PER_DEGREE_F * heatLossFactor * 24;
        
        // Calculate maintenance cost based on heating method
        let maintenanceCost = 0;
        
        switch (heatingMethod) {
            case 'electric':
                // Convert BTUs to kWh and apply efficiency
                const kwhPerDay = (btuLostPerDay / efficiency) * KWH_PER_BTU;
                maintenanceCost = kwhPerDay * energyRate;
                break;
                
            case 'gas-natural':
                // Convert BTUs to therms and apply efficiency
                const thermsPerDay = (btuLostPerDay / efficiency) * THERM_PER_BTU;
                maintenanceCost = thermsPerDay * energyRate;
                break;
                
            case 'gas-propane':
                // Convert BTUs to gallons of propane and apply efficiency
                const propaneGallonsPerDay = (btuLostPerDay / efficiency) / PROPANE_BTU_PER_GALLON;
                maintenanceCost = propaneGallonsPerDay * energyRate;
                break;
                
            case 'heat-pump':
                // Convert BTUs to kWh and apply COP (efficiency)
                const heatPumpKwhPerDay = (btuLostPerDay / efficiency) * KWH_PER_BTU;
                maintenanceCost = heatPumpKwhPerDay * energyRate;
                break;
                
            case 'solar':
                // Solar is free except for pump electricity
                if (pumpWattage > 0 && energyRate > 0) {
                    // Estimate pump running time based on BTUs needed
                    const pumpHoursPerDay = Math.min(12, btuLostPerDay / SOLAR_HEATER_BTU_PER_HOUR);
                    const pumpKwhPerDay = (pumpWattage / 1000) * pumpHoursPerDay;
                    maintenanceCost = pumpKwhPerDay * energyRate;
                } else {
                    maintenanceCost = 0;
                }
                break;
        }
        
        return maintenanceCost;
    }
    
    // Constants for comparison chart standard rates and efficiencies
    const COMPARISON_CHART = {
        ELECTRIC: {
            RATE: 0.15,       // $0.15/kWh
            EFFICIENCY: 0.9   // 90% efficiency
        },
        GAS_NATURAL: {
            RATE: 1.20,       // $1.20/therm
            EFFICIENCY: 0.8   // 80% efficiency
        },
        GAS_PROPANE: {
            RATE: 2.50,       // $2.50/gallon
            EFFICIENCY: 0.8   // 80% efficiency
        },
        HEAT_PUMP: {
            RATE: 0.15,       // $0.15/kWh
            COP: 4.0          // Coefficient of Performance
        },
        SOLAR: {
            RATE: 0.15,       // $0.15/kWh
            PUMP_WATTAGE: 45  // 45W pump
        }
    };
    
    /**
     * Updates the cost comparison chart
     * @param {number} poolVolume - Pool volume in gallons
     * @param {number} currentTempF - Current water temperature in Fahrenheit
     * @param {number} desiredTempF - Desired water temperature in Fahrenheit
     * @param {number} ambientTempF - Ambient air temperature in Fahrenheit
     */
    function updateCostComparisonChart(poolVolume, currentTempF, desiredTempF, ambientTempF) {
        // Calculate BTUs required to heat the water
        const btuRequired = poolVolume * (desiredTempF - currentTempF) * BTU_PER_GALLON_PER_DEGREE_F;
        
        // Calculate costs for each heating method using typical average rates/efficiencies for comparison
        // Note: These are standard values for comparison purposes and may differ from user's specific inputs
        const costs = {
            electric: calculateMethodCost('electric', btuRequired, 
                COMPARISON_CHART.ELECTRIC.RATE, COMPARISON_CHART.ELECTRIC.EFFICIENCY),
            gasNatural: calculateMethodCost('gas-natural', btuRequired, 
                COMPARISON_CHART.GAS_NATURAL.RATE, COMPARISON_CHART.GAS_NATURAL.EFFICIENCY),
            gasPropane: calculateMethodCost('gas-propane', btuRequired, 
                COMPARISON_CHART.GAS_PROPANE.RATE, COMPARISON_CHART.GAS_PROPANE.EFFICIENCY),
            heatPump: calculateMethodCost('heat-pump', btuRequired, 
                COMPARISON_CHART.HEAT_PUMP.RATE, COMPARISON_CHART.HEAT_PUMP.COP),
            solar: calculateMethodCost('solar', btuRequired, 
                COMPARISON_CHART.SOLAR.RATE, 1, COMPARISON_CHART.SOLAR.PUMP_WATTAGE)
        };
        
        // Find maximum cost for scaling
        const maxCost = Math.max(...Object.values(costs));
        
        // Clear previous chart
        elements.results.comparisonChart.innerHTML = '';
        
        // Create bars for each heating method
        createComparisonBar('Electric', costs.electric, maxCost);
        createComparisonBar('Natural Gas', costs.gasNatural, maxCost);
        createComparisonBar('Propane', costs.gasPropane, maxCost);
        createComparisonBar('Heat Pump', costs.heatPump, maxCost);
        createComparisonBar('Solar', costs.solar, maxCost);
        
        // Add note about standardized rates
        const noteElement = document.createElement('p');
        noteElement.className = 'chart-note';
        noteElement.textContent = 'Note: This comparison uses standardized average rates and efficiencies for fair comparison.';
        noteElement.style.fontSize = '0.8em';
        noteElement.style.fontStyle = 'italic';
        noteElement.style.marginTop = '10px';
        elements.results.comparisonChart.appendChild(noteElement);
    }
    
    /**
     * Calculates the cost for a specific heating method
     * @param {string} method - The heating method
     * @param {number} btuRequired - BTUs required to heat the water
     * @param {number} rate - The energy rate
     * @param {number} efficiency - The efficiency factor
     * @param {number} pumpWattage - The pump wattage (for solar only)
     * @returns {number} - The cost for the method
     */
    function calculateMethodCost(method, btuRequired, rate, efficiency, pumpWattage = 0) {
        let cost = 0;
        
        switch (method) {
            case 'electric':
                const kwhRequired = (btuRequired / efficiency) * KWH_PER_BTU;
                cost = kwhRequired * rate;
                break;
                
            case 'gas-natural':
                const thermsRequired = (btuRequired / efficiency) * THERM_PER_BTU;
                cost = thermsRequired * rate;
                break;
                
            case 'gas-propane':
                const propaneGallonsRequired = (btuRequired / efficiency) / PROPANE_BTU_PER_GALLON;
                cost = propaneGallonsRequired * rate;
                break;
                
            case 'heat-pump':
                const heatPumpKwhRequired = (btuRequired / efficiency) * KWH_PER_BTU;
                cost = heatPumpKwhRequired * rate;
                break;
                
            case 'solar':
                if (pumpWattage > 0 && rate > 0) {
                    const pumpHours = btuRequired / SOLAR_HEATER_BTU_PER_HOUR;
                    const pumpKwh = (pumpWattage / 1000) * pumpHours;
                    cost = pumpKwh * rate;
                } else {
                    cost = 0;
                }
                break;
        }
        
        return cost;
    }
    
    /**
     * Creates a bar for the cost comparison chart
     * @param {string} label - The label for the bar
     * @param {number} cost - The cost value
     * @param {number} maxCost - The maximum cost for scaling
     */
    function createComparisonBar(label, cost, maxCost) {
        const percentHeight = maxCost > 0 ? (cost / maxCost) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar-container';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'chart-label';
        labelElement.textContent = label;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${percentHeight}%`;
        
        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = `$${cost.toFixed(2)}`;
        
        barContainer.appendChild(labelElement);
        barContainer.appendChild(bar);
        barContainer.appendChild(value);
        
        elements.results.comparisonChart.appendChild(barContainer);
    }
    
    /**
     * Formats time in hours to a readable string
     * @param {number} hours - Time in hours
     * @returns {string} - Formatted time string
     */
    function formatTime(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} minutes`;
        } else if (hours < 24) {
            const wholeHours = Math.floor(hours);
            const minutes = Math.round((hours - wholeHours) * 60);
            return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`;
        }
    }
    
    /**
     * Gets the pool volume in gallons
     * @returns {number} - The pool volume in gallons
     */
    function getVolumeInGallons() {
        const volume = parseFloat(elements.poolInfo.volume.value);
        const unit = elements.poolInfo.volumeUnit.value;
        
        if (unit === 'liters') {
            return volume * LITERS_TO_GALLONS;
        } else {
            return volume;
        }
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
});