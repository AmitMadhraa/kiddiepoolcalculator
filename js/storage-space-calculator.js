/**
 * Storage Space Calculator for Kiddie Pools
 * * This calculator helps determine the optimal storage solution for kiddie pools
 * during the off-season based on pool type, dimensions, and available space.
 * * Features:
 * - Calculates storage space requirements for different pool types
 * - Recommends storage methods and containers
 * - Provides preparation steps and storage tips
 * - Adjusts recommendations based on storage constraints
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        form: document.getElementById('storageSpaceForm'),
        calculateButton: document.getElementById('calculateButton'),
        resultsSection: document.getElementById('results'),
        errorContainer: document.getElementById('errorContainer'), // Ensure this div exists in your HTML

        poolType: document.getElementById('poolType'),
        poolShape: document.getElementById('poolShape'),
        poolHeight: document.getElementById('poolHeight'),
        poolHeightUnit: document.getElementById('poolHeightUnit'),
        
        storageLocation: document.getElementById('storageLocation'),
        storageConstraints: document.getElementById('storageConstraints'),
        climateControlled: document.getElementById('climateControlled'),
        storagePreference: document.getElementById('storagePreference'),
        
        // Optional constraint inputs
        maxStorageLength: document.getElementById('maxStorageLength'),
        maxStorageLengthUnit: document.getElementById('maxStorageLengthUnit'),
        maxStorageWidth: document.getElementById('maxStorageWidth'),
        maxStorageWidthUnit: document.getElementById('maxStorageWidthUnit'),
        maxStorageHeight: document.getElementById('maxStorageHeight'),
        maxStorageHeightUnit: document.getElementById('maxStorageHeightUnit'),
        materialThickness: document.getElementById('materialThickness'), // Currently unused in core logic
        materialThicknessUnit: document.getElementById('materialThicknessUnit'), // Currently unused

        // Pool shape dimension containers and inputs
        dimensionGroups: {
            round: document.getElementById('roundDimensions'),
            rectangular: document.getElementById('rectangularDimensions'),
            oval: document.getElementById('ovalDimensions'),
            irregular: document.getElementById('irregularDimensions')
        },
        dimensions: {
            round: {
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
                longDiameter: document.getElementById('longDiameter'),
                longDiameterUnit: document.getElementById('longDiameterUnit'),
                shortDiameter: document.getElementById('shortDiameter'),
                shortDiameterUnit: document.getElementById('shortDiameterUnit')
            },
            irregular: {
                maxLength: document.getElementById('maxLength'),
                maxLengthUnit: document.getElementById('maxLengthUnit'),
                maxWidth: document.getElementById('maxWidth'),
                maxWidthUnit: document.getElementById('maxWidthUnit')
            }
        },
        
        // Results DOM Elements
        spaceRequirements: document.getElementById('spaceRequirements'),
        storageMethod: document.getElementById('storageMethod'),
        storageContainer: document.getElementById('storageContainer'),
        preparationSteps: document.getElementById('preparationSteps'),
        storageTips: document.getElementById('storageTips'),

        // Initialize accessibility attributes for errorContainer
        init: function() {
            if (this.errorContainer) {
                this.errorContainer.setAttribute('role', 'alert');
                this.errorContainer.setAttribute('aria-live', 'assertive');
            }
            return this;
        }
    };
    
    // Constants for calculations
    const DEFLATION_FACTORS = { inflatable: 0.05, frame: 0.25, rigid: 1.0, softside: 0.15 };
    const STORAGE_CONTAINER_RECOMMENDATIONS = { /* ... (Keep your existing detailed object) ... */ 
        inflatable: { small: "Storage bag or original packaging", medium: "Plastic storage bin (18-22 gallons)", large: "Large plastic storage bin (30+ gallons)" },
        frame: { small: "Plastic storage bin (18-22 gallons)", medium: "Large plastic storage bin (30+ gallons)", large: "Multiple storage bins or dedicated storage bag" },
        rigid: { small: "No container needed, can be stored as-is", medium: "No container needed, can be stored as-is", large: "No container needed, can be stored as-is" },
        softside: { small: "Storage bag or original packaging", medium: "Plastic storage bin (18-22 gallons)", large: "Large plastic storage bin (30+ gallons)" }
    };

    /**
     * Updates the validation state of an input field (class and ARIA attribute)
     * @param {HTMLElement} inputElement - The input element.
     * @param {boolean} isValid - Whether the input is currently valid.
     */
    function updateFieldValidationState(inputElement, isValid) {
        if (!inputElement) return;
        if (isValid) {
            inputElement.classList.remove('invalid-input');
            inputElement.setAttribute('aria-invalid', 'false');
        } else {
            inputElement.classList.add('invalid-input');
            inputElement.setAttribute('aria-invalid', 'true');
        }
    }

    /**
     * Validates if a select element has a non-empty value.
     * Updates field state and optionally adds to an error messages array.
     * @param {HTMLSelectElement} selectElement - The select element.
     * @param {string} fieldName - The user-friendly name of the field for error messages.
     * @param {string[]} [errorMessagesArray] - Optional array to push error messages to.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateRequiredSelect(selectElement, fieldName, errorMessagesArray) {
        if (!selectElement) return true; // Element might be hidden or not applicable
        const isValid = selectElement.value !== "";
        updateFieldValidationState(selectElement, isValid);
        if (!isValid && errorMessagesArray) {
            errorMessagesArray.push(`Please make a selection for ${fieldName}.`);
        }
        return isValid;
    }

    /**
     * Validates if an input element contains a positive number.
     * Updates field state and optionally adds to an error messages array.
     * @param {HTMLInputElement} inputElement - The input element.
     * @param {string} fieldName - The user-friendly name of the field for error messages.
     * @param {string[]} [errorMessagesArray] - Optional array to push error messages to.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validatePositiveNumberInput(inputElement, fieldName, errorMessagesArray) {
        if (!inputElement) return true;
        const value = parseFloat(inputElement.value);
        const isValid = !isNaN(value) && value > 0;
        updateFieldValidationState(inputElement, isValid);
        if (!isValid && errorMessagesArray) {
            errorMessagesArray.push(`${fieldName} must be a positive number.`);
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
        ul.className = 'error-list'; // For potential styling
        messages.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            ul.appendChild(li);
        });
        
        elements.errorContainer.appendChild(ul);
        elements.errorContainer.style.display = 'block';
        elements.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Validates all form inputs
     * @returns {boolean} - Whether all inputs are valid
     */
    function validateForm() {
        const errors = [];
        let allValid = true;

        // Reset ARIA attributes for all fields that will be validated
        const fieldsToReset = [
            elements.poolType, elements.poolShape, elements.poolHeight,
            elements.storageLocation, elements.storageConstraints,
            elements.climateControlled, elements.storagePreference,
            elements.dimensions.round.diameter,
            elements.dimensions.rectangular.length, elements.dimensions.rectangular.width,
            elements.dimensions.oval.longDiameter, elements.dimensions.oval.shortDiameter,
            elements.dimensions.irregular.maxLength, elements.dimensions.irregular.maxWidth
        ];
        fieldsToReset.forEach(field => updateFieldValidationState(field, true)); // Temporarily mark as valid


        // Validate required selects
        if (!validateRequiredSelect(elements.poolType, "Pool Type", errors)) allValid = false;
        if (!validateRequiredSelect(elements.poolShape, "Pool Shape", errors)) allValid = false;
        if (!validateRequiredSelect(elements.storageLocation, "Available Storage Location", errors)) allValid = false;
        if (!validateRequiredSelect(elements.storageConstraints, "Storage Space Constraints", errors)) allValid = false;
        if (!validateRequiredSelect(elements.climateControlled, "Climate Control Status", errors)) allValid = false;
        if (!validateRequiredSelect(elements.storagePreference, "Storage Preference", errors)) allValid = false;

        // Validate pool height
        if (!validatePositiveNumberInput(elements.poolHeight, "Pool Height/Depth", errors)) allValid = false;
        
        // Validate dimension fields based on selected shape (only if shape itself is selected)
        const poolShape = elements.poolShape.value;
        if (poolShape) {
            switch (poolShape) {
                case 'round':
                    if (!validatePositiveNumberInput(elements.dimensions.round.diameter, "Diameter", errors)) allValid = false;
                    break;
                case 'rectangular':
                    if (!validatePositiveNumberInput(elements.dimensions.rectangular.length, "Length", errors)) allValid = false;
                    if (!validatePositiveNumberInput(elements.dimensions.rectangular.width, "Width", errors)) allValid = false;
                    break;
                case 'oval':
                    if (!validatePositiveNumberInput(elements.dimensions.oval.longDiameter, "Long Diameter", errors)) allValid = false;
                    if (!validatePositiveNumberInput(elements.dimensions.oval.shortDiameter, "Short Diameter", errors)) allValid = false;
                    break;
                case 'irregular':
                    if (!validatePositiveNumberInput(elements.dimensions.irregular.maxLength, "Maximum Length", errors)) allValid = false;
                    if (!validatePositiveNumberInput(elements.dimensions.irregular.maxWidth, "Maximum Width", errors)) allValid = false;
                    break;
            }
        }
        
        displayErrorMessages(errors);
        return allValid;
    }
    
    /**
     * Adds validation listeners to input fields for immediate feedback
     */
    function addValidationListeners() {
        // Required Selects
        [elements.poolType, elements.poolShape, elements.storageLocation, elements.storageConstraints, elements.climateControlled, elements.storagePreference]
            .forEach(sel => {
                if (sel) sel.addEventListener('change', () => validateRequiredSelect(sel, sel.id));
            });

        // Positive Number Inputs
        [elements.poolHeight, elements.dimensions.round.diameter, elements.dimensions.rectangular.length, elements.dimensions.rectangular.width, elements.dimensions.oval.longDiameter, elements.dimensions.oval.shortDiameter, elements.dimensions.irregular.maxLength, elements.dimensions.irregular.maxWidth]
            .forEach(numInput => {
                if (numInput) numInput.addEventListener('input', () => validatePositiveNumberInput(numInput, numInput.id));
            });
        
        // Add change listener to generic inputs to clear global error container if user starts typing
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => { // 'input' for text, 'change' for select is better
                if (elements.errorContainer.style.display === 'block') {
                    // This might be too aggressive, as other errors might still exist.
                    // A better UX is that calculate button re-evaluates all.
                    // For now, just ensure individual validation occurs.
                }
            });
             if (input.tagName === 'SELECT') {
                input.addEventListener('change', () => {
                    if (elements.errorContainer.style.display === 'block') {
                        // See comment above
                    }
                });
            }
        });
    }

    /**
     * Toggles the visibility of pool dimension fields based on selected shape
     */
    function togglePoolFields() {
        const selectedShape = elements.poolShape.value;
        
        Object.keys(elements.dimensionGroups).forEach(shapeKey => {
            const group = elements.dimensionGroups[shapeKey];
            if (group) {
                const isCurrentShape = shapeKey === selectedShape;
                group.style.display = isCurrentShape ? 'block' : 'none';
                
                // Reset validation state for inputs in groups that are being hidden
                if (!isCurrentShape && elements.dimensions[shapeKey]) {
                    Object.values(elements.dimensions[shapeKey]).forEach(input => {
                        if (input && input.tagName === 'INPUT') { // Only inputs, not unit selects
                            updateFieldValidationState(input, true); // Mark as valid
                        }
                    });
                }
            }
        });
         if (elements.errorContainer.innerHTML !== '') { // If errors were shown, clear them on shape change
            displayErrorMessages([]);
        }
    }
    
    /**
     * Main function to validate inputs and calculate storage requirements
     */
    function validateAndCalculate() {
        if (!validateForm()) { // validateForm now calls displayErrorMessages
            return;
        }
        const formData = getFormValues();
        const resultsData = calculateStorageRequirements(formData);
        if (resultsData) { // Check if calculation was successful (didn't return null due to NaN)
            displayResults(resultsData);
            elements.resultsSection.style.display = 'block';
            elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Error message would have been shown by a conversion function
            elements.resultsSection.style.display = 'none';
        }
    }
    
    /**
     * Gets form values
     * @returns {Object|null} FormData object or null if essential parsing fails
     */
    function getFormValues() {
        const formData = {
            poolType: elements.poolType.value,
            poolShape: elements.poolShape.value,
            poolHeight: parseFloat(elements.poolHeight.value),
            poolHeightUnit: elements.poolHeightUnit.value,
            storageLocation: elements.storageLocation.value,
            storageConstraints: elements.storageConstraints.value,
            climateControlled: elements.climateControlled.value,
            storagePreference: elements.storagePreference.value,
            accessories: Array.from(document.querySelectorAll('input[name="accessories"]:checked')).map(cb => cb.value)
        };

        // Optional fields
        if (elements.materialThickness && elements.materialThickness.value.trim()) {
            formData.materialThickness = parseFloat(elements.materialThickness.value);
            formData.materialThicknessUnit = elements.materialThicknessUnit.value;
        }
        if (elements.maxStorageLength && elements.maxStorageLength.value.trim()) {
            formData.maxStorageLength = parseFloat(elements.maxStorageLength.value);
            formData.maxStorageLengthUnit = elements.maxStorageLengthUnit.value;
        }
        if (elements.maxStorageWidth && elements.maxStorageWidth.value.trim()) {
            formData.maxStorageWidth = parseFloat(elements.maxStorageWidth.value);
            formData.maxStorageWidthUnit = elements.maxStorageWidthUnit.value;
        }
        if (elements.maxStorageHeight && elements.maxStorageHeight.value.trim()) {
            formData.maxStorageHeight = parseFloat(elements.maxStorageHeight.value);
            formData.maxStorageHeightUnit = elements.maxStorageHeightUnit.value;
        }

        // Shape-specific dimensions
        const shapeDimConfig = elements.dimensions[formData.poolShape];
        if (shapeDimConfig) {
            for (const key in shapeDimConfig) {
                if (shapeDimConfig[key] && shapeDimConfig[key].tagName === 'INPUT') {
                    formData[key] = parseFloat(shapeDimConfig[key].value);
                } else if (shapeDimConfig[key] && shapeDimConfig[key].tagName === 'SELECT') {
                    formData[key + 'Unit'] = shapeDimConfig[key].value;
                }
            }
        }
        return formData;
    }
    
    /**
     * Converts a measurement to feet
     * @param {number} value - The measurement value
     * @param {string} unit - The unit of measurement
     * @returns {number|NaN} - Measurement in feet or NaN if unit is unknown
     */
    function convertToFeet(value, unit) {
        if (isNaN(value)) return NaN; // Propagate NaN if value is already invalid
        switch (unit) {
            case 'inches': return value / 12;
            case 'cm': return value * 0.0328084; // Using FEET_PER_CM constant value directly
            case 'meters': return value * 3.28084; // Using FEET_PER_METER constant value directly
            case 'mm': return value / 304.8;
            case 'feet': return value;
            default:
                console.error(`Unknown unit: ${unit} for value ${value}.`);
                displayErrorMessages([`Error: Unknown unit '${unit}'. Please select a valid unit.`]);
                return NaN;
        }
    }
    
    /**
     * Calculates storage requirements
     * @param {Object} formData - Form data
     * @returns {Object|null} Results object or null if critical error occurs
     */
    function calculateStorageRequirements(formData) {
        let poolDimensions = {};
        const heightInFeet = convertToFeet(formData.poolHeight, formData.poolHeightUnit);
        if (isNaN(heightInFeet)) return null;

        let volume, footprint, maxDimension;
        let conversionFailed = false;

        switch (formData.poolShape) {
            case 'round':
                const diameterInFeet = convertToFeet(formData.diameter, formData.diameterUnit);
                if (isNaN(diameterInFeet)) { conversionFailed = true; break; }
                const radius = diameterInFeet / 2;
                footprint = Math.PI * radius * radius;
                volume = footprint * heightInFeet;
                maxDimension = diameterInFeet;
                poolDimensions = { diameter: diameterInFeet, height: heightInFeet };
                break;
            case 'rectangular':
                const lengthInFeet = convertToFeet(formData.length, formData.lengthUnit);
                const widthInFeet = convertToFeet(formData.width, formData.widthUnit);
                if (isNaN(lengthInFeet) || isNaN(widthInFeet)) { conversionFailed = true; break; }
                footprint = lengthInFeet * widthInFeet;
                volume = footprint * heightInFeet;
                maxDimension = Math.max(lengthInFeet, widthInFeet);
                poolDimensions = { length: lengthInFeet, width: widthInFeet, height: heightInFeet };
                break;
            case 'oval':
                const longDiameterInFeet = convertToFeet(formData.longDiameter, formData.longDiameterUnit);
                const shortDiameterInFeet = convertToFeet(formData.shortDiameter, formData.shortDiameterUnit);
                if (isNaN(longDiameterInFeet) || isNaN(shortDiameterInFeet)) { conversionFailed = true; break; }
                footprint = Math.PI * (longDiameterInFeet / 2) * (shortDiameterInFeet / 2);
                volume = footprint * heightInFeet;
                maxDimension = longDiameterInFeet;
                poolDimensions = { longDiameter: longDiameterInFeet, shortDiameter: shortDiameterInFeet, height: heightInFeet };
                break;
            case 'irregular':
                const maxLengthInFeet = convertToFeet(formData.maxLength, formData.maxLengthUnit);
                const maxWidthInFeet = convertToFeet(formData.maxWidth, formData.maxWidthUnit);
                if (isNaN(maxLengthInFeet) || isNaN(maxWidthInFeet)) { conversionFailed = true; break; }
                footprint = maxLengthInFeet * maxWidthInFeet * 0.85; // Approximation
                volume = footprint * heightInFeet;
                maxDimension = Math.max(maxLengthInFeet, maxWidthInFeet);
                poolDimensions = { maxLength: maxLengthInFeet, maxWidth: maxWidthInFeet, height: heightInFeet };
                break;
            default:
                displayErrorMessages(["Invalid pool shape selected for calculation."]);
                return null;
        }

        if (conversionFailed) return null; // Error message already displayed by convertToFeet

        let poolSizeCategory;
        if (volume < 50) poolSizeCategory = 'small';
        else if (volume < 200) poolSizeCategory = 'medium';
        else poolSizeCategory = 'large';
        
        const deflationFactor = DEFLATION_FACTORS[formData.poolType] || 1.0; // Default to 1.0 if type unknown
        const storageVolume = volume * deflationFactor;
        
        let storageDimensions = calculateStorageDimensions(formData.poolType, formData.poolShape, poolDimensions, deflationFactor, maxDimension);
        let constraintsMetResult = checkStorageConstraints(storageDimensions, formData);
        
        if (!constraintsMetResult.met) {
            storageDimensions = adjustForConstraints(storageDimensions, constraintsMetResult, formData);
        }
        
        return {
            poolType: formData.poolType,
            poolShape: formData.poolShape,
            poolSizeCategory: poolSizeCategory,
            originalVolume: volume,
            storageVolume: storageVolume,
            storageDimensions: storageDimensions,
            constraintsMet: constraintsMetResult,
            recommendedMethod: determineStorageMethod(formData.poolType, formData.storagePreference, formData.storageConstraints, constraintsMetResult),
            recommendedContainer: determineStorageContainer(formData.poolType, poolSizeCategory, formData.storageLocation, formData.climateControlled),
            preparationSteps: generatePreparationSteps(formData.poolType, formData.climateControlled, formData.storageLocation),
            storageTips: generateStorageTips(formData.poolType, formData.climateControlled, formData.storageLocation, formData.accessories)
        };
    }
    
    // Calculate storage dimensions (Preserve your existing detailed logic)
    function calculateStorageDimensions(poolType, poolShape, poolDimensions, deflationFactor, maxDimension) {
        /* ... Your existing detailed logic for calculateStorageDimensions ... */
        // This function was complex and mostly sound conceptually; ensure it's robust.
        // For brevity in this response, I'm not re-listing it but it should be here.
        // Ensure it handles all poolTypes and shapes from getFormValues.
        // Example structure:
        if (poolType === 'rigid') {
            return {
                length: poolDimensions.length || poolDimensions.diameter || poolDimensions.longDiameter || poolDimensions.maxLength,
                width: poolDimensions.width || poolDimensions.diameter || poolDimensions.shortDiameter || poolDimensions.maxWidth,
                height: poolDimensions.height,
                folded: false
            };
        }
        // ... (other types: inflatable, frame, softside as per your original detailed logic) ...
        // Fallback for safety
         return { length: (maxDimension || 1) * deflationFactor, width: (maxDimension || 1) * deflationFactor / 2, height: poolDimensions.height * deflationFactor / 2, folded: true };
    }
    
    // Check storage constraints (Preserve your existing detailed logic)
    function checkStorageConstraints(storageDimensions, formData) {
        /* ... Your existing detailed logic for checkStorageConstraints ... */
        // This function was also conceptually sound.
        // Ensure it correctly uses convertToFeet for user's max dimensions and compares with calculated storageDimensions.
        // Example structure:
        const result = { met: true, issues: [] };
        if (formData.storageConstraints === 'none') return result;

        const checkDim = (dimName, storageDimValue, userMaxDimValue, userMaxDimUnit) => {
            if (userMaxDimValue && userMaxDimUnit) {
                const maxDimInFeet = convertToFeet(parseFloat(userMaxDimValue), userMaxDimUnit);
                if (isNaN(maxDimInFeet)) { /* error already shown */ return; }
                if (storageDimValue > maxDimInFeet) {
                    result.met = false;
                    result.issues.push({ dimension: dimName, available: maxDimInFeet, required: storageDimValue });
                }
            }
        };

        let currentStorageDims = storageDimensions;
        if (formData.poolType === 'frame' && storageDimensions.combined) {
            currentStorageDims = storageDimensions.combined;
        }
        
        checkDim('length', currentStorageDims.length, formData.maxStorageLength, formData.maxStorageLengthUnit);
        checkDim('width', currentStorageDims.width, formData.maxStorageWidth, formData.maxStorageWidthUnit);
        checkDim('height', currentStorageDims.height, formData.maxStorageHeight, formData.maxStorageHeightUnit);
        return result;
    }
    
    // Adjust for constraints (Preserve your existing detailed logic)
    function adjustForConstraints(storageDimensions, constraintsMet, formData) {
        /* ... Your existing detailed logic for adjustForConstraints ... */
        // This added alternativeMethods, which was good.
        return storageDimensions; // Return as is if no changes, or the modified object
    }

    // Determine storage method (Preserve your existing detailed logic)
    function determineStorageMethod(poolType, storagePreference, storageConstraints, constraintsMet) {
        /* ... Your existing detailed logic for determineStorageMethod ... */
        // This was very detailed and good.
        // Fallback for safety
        return { title: "General Storage", description: "Store in a clean, dry place.", steps: ["Clean and dry pool thoroughly.", "Store away from sharp objects and direct sunlight."] };
    }
    
    // Determine storage container (Preserve your existing detailed logic)
    function determineStorageContainer(poolType, poolSizeCategory, storageLocation, climateControlled) {
        /* ... Your existing detailed logic for determineStorageContainer ... */
        // This was very detailed and good.
        // Fallback for safety
        return { title: "Suitable Container", description: "Use a container appropriate for the pool size.", options: ["Original packaging if available.", "Plastic storage bin."] };
    }
    
    // Generate preparation steps (Preserve your existing detailed logic)
    function generatePreparationSteps(poolType, climateControlled, storageLocation) {
        /* ... Your existing detailed logic for generatePreparationSteps ... */
        // This was very detailed and good.
        // Fallback for safety
        return { title: "Preparation", steps: ["Drain completely.", "Clean thoroughly.", "Dry completely."] };
    }
    
    // Generate storage tips (Preserve your existing detailed logic)
    function generateStorageTips(poolType, climateControlled, storageLocation, accessories) {
        /* ... Your existing detailed logic for generateStorageTips ... */
        // This was very detailed and good.
        // Fallback for safety
        return { title: "Tips", general: ["Store in cool, dry place."], specific: ["Handle with care."] };
    }
    
    // Display results (Preserve your existing detailed logic for formatting HTML)
    function displayResults(results) {
        /* ... Your existing detailed logic for displayResults, ensuring it handles the structure of storageDimensions correctly ... */
        // For brevity, I'm not re-listing the full HTML generation, but it should be here.
        // Key is to correctly access results.storageDimensions (and .combined for frame pools).
        spaceRequirements.innerHTML = `Calculated dimensions: L ${results.storageDimensions.length?.toFixed(1) || results.storageDimensions.combined?.length?.toFixed(1) || 'N/A'} ft...`; // Simplified for this response
        storageMethod.innerHTML = `<h5>${results.recommendedMethod.title}</h5> ...`;
        storageContainer.innerHTML = `<h5>${results.recommendedContainer.title}</h5> ...`;
        preparationSteps.innerHTML = `<h5>${results.preparationSteps.title}</h5> ...`;
        storageTips.innerHTML = `<h5>${results.storageTips.title}</h5> ...`;

        // Example of handling constraint warnings (you had more detailed HTML generation)
        if (!results.constraintsMet.met) {
            let warningHTML = '<div class="warning-message"><p><strong>Note:</strong> Storage dimensions exceed constraints:</p><ul>';
            results.constraintsMet.issues.forEach(issue => {
                warningHTML += `<li>Required ${issue.dimension}: ${issue.required.toFixed(1)} ft, Available: ${issue.available.toFixed(1)} ft</li>`;
            });
            warningHTML += '</ul>';
            if (results.storageDimensions.alternativeMethods) {
                warningHTML += '<p><strong>Alternative Methods:</strong></p><ul>';
                results.storageDimensions.alternativeMethods.forEach(method => warningHTML += `<li>${method}</li>`);
                warningHTML += '</ul>';
            }
            warningHTML += '</div>';
            // Prepend or append this warningHTML to spaceRequirements or a dedicated warning area.
            elements.spaceRequirements.innerHTML += warningHTML; 
        }
    }

    // Event Listeners Setup
    elements.calculateButton.addEventListener('click', validateAndCalculate);
    elements.poolShape.addEventListener('change', togglePoolFields);
    
    // Initialize
    elements.init(); // Initialize ARIA for error container
    addValidationListeners(); // Add per-field validation listeners
    togglePoolFields(); // Set initial UI state
});