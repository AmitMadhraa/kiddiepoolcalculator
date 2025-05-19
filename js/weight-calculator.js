/**
 * Weight Calculator for Kiddie Pools
 * 
 * This script calculates the total weight of a filled kiddie pool based on
 * pool dimensions or volume, fill level, and occupants.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const elements = {
        // Form elements
        form: document.getElementById('weightCalculatorForm'),
        errorContainer: document.getElementById('errorContainer'),
        poolType: document.getElementById('poolType'),
        calculationMethod: document.getElementById('calculationMethod'),
        
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
        
        // Volume section elements
        volumeSection: document.getElementById('volumeSection'),
        waterVolume: document.getElementById('waterVolume'),
        volumeUnit: document.getElementById('volumeUnit'),
        surfaceArea: document.getElementById('surfaceArea'),
        areaUnit: document.getElementById('areaUnit'),
        
        // Additional factors
        fillLevel: document.getElementById('fillLevel'),
        occupants: document.getElementById('occupants'),
        avgOccupantWeight: document.getElementById('avgOccupantWeight'),
        weightUnit: document.getElementById('weightUnit'),
        
        // Button
        calculateButton: document.getElementById('calculateButton'),
        
        // Results elements
        results: document.getElementById('results'),
        totalWeightResult: document.getElementById('totalWeightResult'),
        breakdownResult: document.getElementById('breakdownResult'),
        distributionResult: document.getElementById('distributionResult'),
        surfaceResult: document.getElementById('surfaceResult')
    };
    
    // Constants for calculations and conversions
    const WATER_WEIGHT_LBS_PER_GALLON = 8.34;
    const WATER_WEIGHT_KG_PER_LITER = 1.0;
    const GALLONS_TO_LITERS = 3.78541;
    const LITERS_TO_GALLONS = 0.264172;
    const FEET_TO_METERS = 0.3048;
    const METERS_TO_FEET = 3.28084;
    const INCHES_TO_FEET = 1/12;
    const CM_TO_METERS = 1/100;
    const SQFT_TO_SQM = 0.092903;
    const SQM_TO_SQFT = 10.7639;
    const KG_TO_LBS = 2.20462;
    const LBS_TO_KG = 0.453592;
    const CUBIC_FEET_TO_GALLONS = 7.48052; // Gallons per cubic foot
    const PI = Math.PI;
    
    // Empty pool weights by type and size (in pounds)
    const EMPTY_POOL_WEIGHTS = {
        inflatable: {
            tiny: 3,      // < 50 gallons
            small: 8,     // 50-150 gallons
            medium: 15,   // 150-300 gallons
            large: 25,    // 300-1000 gallons
            xlarge: 40    // > 1000 gallons
        },
        framed: {
            tiny: 15,     // < 50 gallons
            small: 30,    // 50-150 gallons
            medium: 50,   // 150-300 gallons
            large: 80,    // 300-1000 gallons
            xlarge: 120   // > 1000 gallons
        },
        rigid: {
            tiny: 5,      // < 50 gallons
            small: 12,    // 50-150 gallons
            medium: 20,   // 150-300 gallons
            large: 35,    // 300-1000 gallons
            xlarge: 60    // > 1000 gallons
        },
        softside: {
            tiny: 8,      // < 50 gallons
            small: 15,    // 50-150 gallons
            medium: 25,   // 150-300 gallons
            large: 40,    // 300-1000 gallons
            xlarge: 70    // > 1000 gallons
        }
    };
    
    // Surface load capacity recommendations (in pounds per square foot)
    const SURFACE_LOAD_CAPACITIES = {
        balcony: {
            min: 40,
            max: 60,
            recommendation: "Most apartment balconies are NOT suitable for kiddie pools due to weight limitations and potential water damage risks."
        },
        elevatedDeck: {
            min: 40,
            max: 60,
            recommendation: "Standard elevated decks can support smaller kiddie pools if the weight is distributed evenly and the deck is in good condition. For larger pools, consult a structural engineer."
        },
        groundLevelDeck: {
            min: 100,
            max: 150,
            recommendation: "Ground-level decks can typically support most kiddie pools, but ensure the deck is in good condition and the weight is distributed evenly."
        },
        concretePatio: {
            min: 400,
            max: 600,
            recommendation: "Concrete patios are ideal for kiddie pools of all sizes, as they can easily support the weight."
        },
        lawn: {
            min: 200,
            max: 300,
            recommendation: "Lawns can support most kiddie pools, but use a ground cloth to protect both the lawn and pool. Extended periods may damage grass due to lack of sunlight."
        }
    };
    
    // Add event listeners
    elements.calculateButton.addEventListener('click', calculateWeight);
    elements.calculationMethod.addEventListener('change', toggleCalculationMethod);
    elements.poolShape.addEventListener('change', togglePoolShape);
    
    // Add input validation
    addValidationListeners();
    
    // Initialize form
    toggleCalculationMethod();
    togglePoolShape();
    
    /**
     * Toggles between dimensions and volume calculation methods
     */
    function toggleCalculationMethod() {
        const method = elements.calculationMethod.value;
        
        if (method === 'dimensions') {
            elements.dimensionsSection.style.display = 'block';
            elements.volumeSection.style.display = 'none';
        } else {
            elements.dimensionsSection.style.display = 'none';
            elements.volumeSection.style.display = 'block';
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
     * Adds validation listeners to all input fields
     */
    function addValidationListeners() {
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
        
        // Validate numeric inputs for volume
        elements.waterVolume.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        elements.surfaceArea.addEventListener('input', function() {
            validatePositiveNumber(this);
        });
        
        // Validate numeric inputs for additional factors
        elements.fillLevel.addEventListener('input', function() {
            validateRange(this, 10, 100);
        });
        
        elements.occupants.addEventListener('input', function() {
            validateRange(this, 0, 20);
        });
        
        elements.avgOccupantWeight.addEventListener('input', function() {
            validateRange(this, 10, 300);
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
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    function validateRange(input, min, max) {
        const value = parseFloat(input.value);
        const isValid = !isNaN(value) && value >= min && value <= max;
        
        if (isValid) {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        } else {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        return isValid;
    }
    
    function validateForm() {
        let isValid = true;
        elements.errorContainer.innerHTML = '';
        const errorMessages = [];
        
        if (elements.calculationMethod.value === 'dimensions') {
            const shape = elements.poolShape.value;
            
            if (shape === 'round') {
                if (!validatePositiveNumber(elements.diameter)) {
                    isValid = false;
                    errorMessages.push('Diameter must be a positive number.');
                }
            } else if (shape === 'rectangular') {
                if (!validatePositiveNumber(elements.length)) {
                    isValid = false;
                    errorMessages.push('Length must be a positive number.');
                }
                if (!validatePositiveNumber(elements.width)) {
                    isValid = false;
                    errorMessages.push('Width must be a positive number.');
                }
            } else if (shape === 'oval') {
                if (!validatePositiveNumber(elements.longDiameter)) {
                    isValid = false;
                    errorMessages.push('Long diameter must be a positive number.');
                }
                if (!validatePositiveNumber(elements.shortDiameter)) {
                    isValid = false;
                    errorMessages.push('Short diameter must be a positive number.');
                }
            }
            
            if (!validatePositiveNumber(elements.depth)) {
                isValid = false;
                errorMessages.push('Depth must be a positive number.');
            }
        } else {
            if (!validatePositiveNumber(elements.waterVolume)) {
                isValid = false;
                errorMessages.push('Water volume must be a positive number.');
            }
            if (!validatePositiveNumber(elements.surfaceArea)) {
                isValid = false;
                errorMessages.push('Surface area must be a positive number.');
            }
        }
        
        if (!validateRange(elements.fillLevel, 1, 100)) {
            isValid = false;
            errorMessages.push('Fill level must be between 1% and 100%.');
        }
        if (!validatePositiveNumber(elements.occupants)) {
            isValid = false;
            errorMessages.push('Number of occupants must be a positive number.');
        }
        if (!validatePositiveNumber(elements.avgOccupantWeight)) {
            isValid = false;
            errorMessages.push('Average occupant weight must be a positive number.');
        }
        
        if (!isValid) {
            errorMessages.forEach(message => addError(message));
        }
        
        return isValid;
    }
    
    function addError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        elements.errorContainer.appendChild(errorElement);
        elements.errorContainer.style.display = 'block';
        elements.errorContainer.setAttribute('role', 'alert');
        elements.errorContainer.setAttribute('aria-live', 'assertive');
    }

    function calculateWeight() {
        if (!validateForm()) {
            elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        const poolType = elements.poolType.value;
        const calculationMethod = elements.calculationMethod.value;
        const fillLevel = parseFloat(elements.fillLevel.value) / 100;
        const occupants = parseInt(elements.occupants.value);
        const avgOccupantWeight = getWeightInPounds(
            parseFloat(elements.avgOccupantWeight.value),
            elements.weightUnit.value
        );
        
        let waterVolume, surfaceArea;
        
        if (calculationMethod === 'dimensions') {
            const result = calculateVolumeFromDimensions();
            waterVolume = result.volume;
            surfaceArea = result.surfaceArea;
        } else {
            waterVolume = getVolumeInGallons(
                parseFloat(elements.waterVolume.value),
                elements.volumeUnit.value
            );
            surfaceArea = getAreaInSqFt(
                parseFloat(elements.surfaceArea.value),
                elements.areaUnit.value
            );
        }
        
        const actualWaterVolume = waterVolume * fillLevel;
        
        const waterWeight = actualWaterVolume * WATER_WEIGHT_LBS_PER_GALLON;
        
        const poolSizeCategory = getPoolSizeCategory(waterVolume);
        
        const emptyPoolWeight = EMPTY_POOL_WEIGHTS[poolType][poolSizeCategory];
        
        const occupantWeight = occupants * avgOccupantWeight;
        
        const totalWeight = waterWeight + emptyPoolWeight + occupantWeight;
        
        const weightDistribution = totalWeight / surfaceArea;
        
        const surfaceRecommendations = generateSurfaceRecommendations(weightDistribution);
        
        displayResults(
            totalWeight,
            waterWeight,
            emptyPoolWeight,
            occupantWeight,
            weightDistribution,
            surfaceRecommendations
        );
        
        elements.results.style.display = 'block';
        
        elements.results.scrollIntoView({ behavior: 'smooth' });
    }

    function calculateVolumeFromDimensions() {
        const shape = elements.poolShape.value;
        let volume, surfaceArea;
        
        const depth = getLengthInFeet(
            parseFloat(elements.depth.value),
            elements.depthUnit.value
        );
        
        if (shape === 'round') {
            const diameter = getLengthInFeet(
                parseFloat(elements.diameter.value),
                elements.diameterUnit.value
            );
            
            const radius = diameter / 2;
            
            surfaceArea = PI * radius * radius;
            
            const volumeCubicFeet = (PI * Math.pow(diameter / 2, 2) * depth);
            const volumeGallons = volumeCubicFeet * CUBIC_FEET_TO_GALLONS;
            
            volume = volumeGallons;
        } else if (shape === 'rectangular') {
            const length = getLengthInFeet(
                parseFloat(elements.length.value),
                elements.lengthUnit.value
            );
            
            const width = getLengthInFeet(
                parseFloat(elements.width.value),
                elements.widthUnit.value
            );
            
            surfaceArea = length * width;
            
            const volumeCubicFeet = length * width * depth;
            const volumeGallons = volumeCubicFeet * CUBIC_FEET_TO_GALLONS;
            
            volume = volumeGallons;
        } else if (shape === 'oval') {
            const longDiameter = getLengthInFeet(
                parseFloat(elements.longDiameter.value),
                elements.longDiameterUnit.value
            );
            
            const shortDiameter = getLengthInFeet(
                parseFloat(elements.shortDiameter.value),
                elements.shortDiameterUnit.value
            );
            
            const a = longDiameter / 2;
            const b = shortDiameter / 2;
            
            surfaceArea = PI * a * b;
            
            const volumeCubicFeet = (PI * (longDiameter / 2) * (shortDiameter / 2) * depth);
            const volumeGallons = volumeCubicFeet * CUBIC_FEET_TO_GALLONS;
            
            volume = volumeGallons;
        }
        
        return {
            volume: volume,
            surfaceArea: surfaceArea
        };
    }

    function getPoolSizeCategory(volumeGallons) {
        if (volumeGallons < 50) {
            return 'tiny';
        } else if (volumeGallons < 150) {
            return 'small';
        } else if (volumeGallons < 300) {
            return 'medium';
        } else if (volumeGallons < 1000) {
            return 'large';
        } else {
            return 'xlarge';
        }
    }

    function generateSurfaceRecommendations(weightPerSqFt) {
        const suitable = [];
        const unsuitable = [];
        
        for (const [surface, capacity] of Object.entries(SURFACE_LOAD_CAPACITIES)) {
            if (weightPerSqFt <= capacity.max) {
                suitable.push({
                    type: surface,
                    recommendation: capacity.recommendation
                });
            } else {
                unsuitable.push({
                    type: surface,
                    recommendation: `This surface's maximum capacity of ${capacity.max} lbs/sqft is exceeded. ${capacity.recommendation}`
                });
            }
        }
        
        return {
            suitable: suitable,
            unsuitable: unsuitable
        };
    }

    function displayResults(
        totalWeight,
        waterWeight,
        emptyPoolWeight,
        occupantWeight,
        weightDistribution,
        surfaceRecommendations
    ) {
        const formattedTotalWeight = formatWeight(totalWeight);
        const formattedWaterWeight = formatWeight(waterWeight);
        const formattedEmptyPoolWeight = formatWeight(emptyPoolWeight);
        const formattedOccupantWeight = formatWeight(occupantWeight);
        const formattedWeightDistribution = formatWeightDistribution(weightDistribution);
        
        elements.totalWeightResult.innerHTML = `
            <p class="weight-result">Approximately <strong>${formattedTotalWeight}</strong></p>
            <p>This includes the weight of the water, pool structure, and occupants.</p>
        `;
        
        elements.breakdownResult.innerHTML = `
            <ul>
                <li><strong>Water Weight:</strong> ${formattedWaterWeight} (${Math.round(waterWeight / totalWeight * 100)}% of total)</li>
                <li><strong>Pool Structure Weight:</strong> ${formattedEmptyPoolWeight} (${Math.round(emptyPoolWeight / totalWeight * 100)}% of total)</li>
                <li><strong>Occupant Weight:</strong> ${formattedOccupantWeight} (${Math.round(occupantWeight / totalWeight * 100)}% of total)</li>
            </ul>
        `;
        
        elements.distributionResult.innerHTML = `
            <p>Your pool exerts <strong>${formattedWeightDistribution}</strong> on the supporting surface.</p>
            <p>This is the total weight divided by the area the pool covers.</p>
        `;
        
        elements.surfaceResult.innerHTML = '';
        
        if (surfaceRecommendations.suitable.length > 0) {
            elements.surfaceResult.innerHTML += `
                <p><strong>Suitable Surfaces:</strong></p>
                <ul class="suitable-surfaces">
                    ${surfaceRecommendations.suitable.map(surface => 
                        `<li><strong>${formatSurfaceType(surface.type)}:</strong> ${surface.recommendation}</li>`
                    ).join('')}
                </ul>
            `;
        }
        
        if (surfaceRecommendations.unsuitable.length > 0) {
            elements.surfaceResult.innerHTML += `
                <p><strong>Potentially Unsuitable Surfaces:</strong></p>
                <ul class="unsuitable-surfaces">
                    ${surfaceRecommendations.unsuitable.map(surface => 
                        `<li><strong>${formatSurfaceType(surface.type)}:</strong> ${surface.recommendation}</li>`
                    ).join('')}
                </ul>
            `;
        }
        
        elements.surfaceResult.innerHTML += `
            <p class="caution-note"><strong>Note:</strong> These are general guidelines. For specific structural advice, consult a professional.</p>
        `;
    }

    function formatWeight(weightLbs) {
        const weightKg = weightLbs * LBS_TO_KG;
        return `${Math.round(weightLbs).toLocaleString()} pounds (${Math.round(weightKg).toLocaleString()} kg)`;
    }

    function formatWeightDistribution(weightPerSqFt) {
        const weightPerSqM = weightPerSqFt / SQM_TO_SQFT;
        return `${Math.round(weightPerSqFt).toLocaleString()} pounds per square foot (${Math.round(weightPerSqM).toLocaleString()} kg/m²)`;
    }

    function formatSurfaceType(surfaceType) {
        return surfaceType
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    function getLengthInFeet(length, unit) {
        switch (unit) {
            case 'feet':
                return length;
            case 'inches':
                return length * INCHES_TO_FEET;
            case 'meters':
                return length * METERS_TO_FEET;
            case 'cm':
                return length * CM_TO_METERS * METERS_TO_FEET;
            default:
                console.error(`Unknown length unit: ${unit}. Defaulting to feet.`);
                return length;
        }
    }

    function getVolumeInGallons(volume, unit) {
        switch (unit) {
            case 'gallons':
                return volume;
            case 'liters':
                return volume * LITERS_TO_GALLONS;
            default:
                console.error(`Unknown volume unit: ${unit}. Defaulting to gallons.`);
                return volume;
        }
    }

    function getAreaInSqFt(area, unit) {
        switch (unit) {
            case 'sqft':
                return area;
            case 'sqm':
                return area * SQM_TO_SQFT;
            case 'sqin':
                return area / 144;
            default:
                console.error(`Unknown area unit: ${unit}. Defaulting to square feet.`);
                return area;
        }
    }

    function getWeightInPounds(weight, unit) {
        switch (unit) {
            case 'pounds':
                return weight;
            case 'kg':
                return weight * KG_TO_LBS;
            default:
                return weight;
        }
    }
});
