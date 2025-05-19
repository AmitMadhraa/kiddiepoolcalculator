/**
 * Kiddie Pool Capacity Calculator
 * 
 * This script calculates how many people can comfortably use a kiddie pool
 * based on pool dimensions, user age groups, and comfort preferences.
 * 
 * Features:
 * - Calculates recommended and maximum capacity
 * - Provides safety considerations based on user inputs
 * - Offers optimization tips for maximizing pool usage
 * - Includes visual representation of capacity
 */

// Conversion constants
const CONVERSION = {
    METERS_TO_FEET: 3.28084,
    INCHES_TO_FEET: 1/12,
    CM_TO_FEET: 1/30.48,
    SQ_METERS_TO_SQ_FEET: 10.7639,
    PI: Math.PI
};

// Space requirements constants (in square feet)
const SPACE_REQUIREMENTS = {
    TODDLERS: 7,         // 6-8 sq ft per toddler
    PRESCHOOLERS: 9,     // 8-10 sq ft per preschooler
    CHILDREN: 12,        // 10-15 sq ft per child
    MIXED_CHILDREN: 10,  // Average for mixed children
    FAMILY: 15,          // Average for mixed family
    ADULTS: 18,          // 15-20 sq ft per adult
    DEFAULT: 12          // Default fallback
};

// Comfort level multipliers
const COMFORT_MULTIPLIERS = {
    SPACIOUS: 1.5,      // 50% more space for maximum comfort
    COMFORTABLE: 1.2,   // 20% more space for recommended comfort
    COZY: 1,            // Standard space
    PACKED: 0.8         // 20% less space for maximum capacity
};

// Activity level multipliers
const ACTIVITY_MULTIPLIERS = {
    LOW: 0.9,           // 10% less space for low activity
    MODERATE: 1,        // Standard space for moderate activity
    HIGH: 1.3           // 30% more space for high activity
};

// Minimum space percentage of base (for absolute minimum capacity)
const MIN_SPACE_PERCENTAGE = 0.8;

// Maximum number of person icons to display in visualization
const MAX_VISUAL_ICONS = 20;

document.addEventListener('DOMContentLoaded', function() {
    // Cache all DOM elements for consistent access
    const elements = {
        // Add poolType to elements for consistency
        poolType: document.getElementById('poolType'),
        // Form elements
        form: document.getElementById('capacityForm'),
        calculateButton: document.getElementById('calculateButton'),
        resultsSection: document.getElementById('results'),
        errorContainer: document.getElementById('errorContainer'),
        
        // Pool shape selection and dimension containers
        poolShapeSelect: document.getElementById('poolShape'),
        dimensionsContainer: document.getElementById('dimensionsContainer'),
        roundDimensions: document.getElementById('roundDimensions'),
        rectangularDimensions: document.getElementById('rectangularDimensions'),
        ovalDimensions: document.getElementById('ovalDimensions'),
        irregularDimensions: document.getElementById('irregularDimensions'),
        
        // Input elements for dimensions
        diameter: document.getElementById('diameter'),
        diameterUnit: document.getElementById('diameterUnit'),
        length: document.getElementById('length'),
        lengthUnit: document.getElementById('lengthUnit'),
        width: document.getElementById('width'),
        widthUnit: document.getElementById('widthUnit'),
        majorAxis: document.getElementById('majorAxis'),
        majorAxisUnit: document.getElementById('majorAxisUnit'),
        minorAxis: document.getElementById('minorAxis'),
        minorAxisUnit: document.getElementById('minorAxisUnit'),
        surfaceArea: document.getElementById('surfaceArea'),
        surfaceAreaUnit: document.getElementById('surfaceAreaUnit'),
        poolDepth: document.getElementById('poolDepth'),
        poolDepthUnit: document.getElementById('poolDepthUnit'),
        
        // User preference elements
        ageGroups: document.getElementById('ageGroups'),
        comfortLevel: document.getElementById('comfortLevel'),
        activityLevel: document.getElementById('activityLevel'),
        supervisionRatio: document.getElementById('supervisionRatio'),
        
        // Result display elements
        recommendedCapacity: document.getElementById('recommendedCapacity'),
        maximumCapacity: document.getElementById('maximumCapacity'),
        poolSurfaceArea: document.getElementById('poolSurfaceArea'),
        spacePerPerson: document.getElementById('spacePerPerson'),
        safetyConsiderations: document.getElementById('safetyConsiderations'),
        optimizationTips: document.getElementById('optimizationTips'),
        capacityVisualization: document.getElementById('capacityVisualization')
    };
    
    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Show/hide dimension inputs based on pool shape selection
        elements.poolShapeSelect.addEventListener('change', function() {
            showDimensionInputs(this.value);
        });
        
        // Calculate button click event
        elements.calculateButton.addEventListener('click', function() {
            if (validateForm()) {
                const formData = getFormData();
                const results = calculateCapacity(formData);
                displayResults(results);
                scrollToResults();
            }
        });
        
        // Form input validation on change
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', function() {
                // Clear error styling when user corrects input
                this.classList.remove('error');
                elements.errorContainer.textContent = '';
                elements.errorContainer.style.display = 'none';
            });
        });
    }
    
    /**
     * Show dimension inputs based on selected pool shape
     * @param {string} shape - The selected pool shape
     */
    function showDimensionInputs(shape) {
        // Hide all dimension groups first
        [elements.roundDimensions, elements.rectangularDimensions, elements.ovalDimensions, elements.irregularDimensions].forEach(container => {
            container.style.display = 'none';
            
            // Disable required attribute for hidden inputs to prevent validation errors
            container.querySelectorAll('input').forEach(input => {
                input.required = false;
            });
        });
        
        // Show the appropriate dimension group based on selected shape
        switch(shape) {
            case 'round':
                elements.roundDimensions.style.display = 'block';
                elements.roundDimensions.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
                break;
            case 'rectangular':
                elements.rectangularDimensions.style.display = 'block';
                elements.rectangularDimensions.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
                break;
            case 'oval':
                elements.ovalDimensions.style.display = 'block';
                elements.ovalDimensions.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
                break;
            case 'irregular':
                elements.irregularDimensions.style.display = 'block';
                elements.irregularDimensions.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
                break;
        }
    }
    
    /**
     * Validate form inputs
     * @returns {boolean} - Whether the form is valid
     */
    function validateForm() {
        let isValid = true;
        elements.errorContainer.textContent = '';
        elements.errorContainer.style.display = 'none';
        const errorMessages = [];
        
        // Reset error styling
        elements.form.querySelectorAll('input, select').forEach(input => {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        });
        
        // Check required selects
        elements.form.querySelectorAll('select[required]').forEach(select => {
            if (!select.value) {
                select.classList.add('error');
                select.setAttribute('aria-invalid', 'true');
                isValid = false;
                errorMessages.push(`${select.previousElementSibling.textContent.replace(':', '')} is required.`);
            }
        });
        
        // Check required inputs that are visible (based on pool shape)
        const visibleInputs = elements.form.querySelectorAll('div[style*="display: block"] input[required], div:not([style*="display: none"]) input[required]');
        visibleInputs.forEach(input => {
            if (!input.value) {
                input.classList.add('error');
                input.setAttribute('aria-invalid', 'true');
                isValid = false;
                errorMessages.push(`${input.closest('.form-group').querySelector('label').textContent.replace(':', '')} is required.`);
            } else if (isNaN(parseFloat(input.value))) {
                input.classList.add('error');
                input.setAttribute('aria-invalid', 'true');
                isValid = false;
                errorMessages.push(`${input.closest('.form-group').querySelector('label').textContent.replace(':', '')} must be a number.`);
            } else if (parseFloat(input.value) <= 0) {
                input.classList.add('error');
                input.setAttribute('aria-invalid', 'true');
                isValid = false;
                errorMessages.push(`${input.closest('.form-group').querySelector('label').textContent.replace(':', '')} must be greater than zero.`);
            }
        });
        
        // Display error messages if validation fails
        if (!isValid) {
            // Limit to top 3 errors to avoid overwhelming the user
            const displayErrors = errorMessages.slice(0, 3);
            if (errorMessages.length > 3) {
                displayErrors.push('...and other fields need attention.');
            }
            
            elements.errorContainer.innerHTML = displayErrors.map(msg => `<div>${msg}</div>`).join('');
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
            poolShape: elements.poolShapeSelect.value,
            poolDepth: parseFloat(elements.poolDepth.value),
            poolDepthUnit: elements.poolDepthUnit.value,
            ageGroups: elements.ageGroups.value,
            comfortLevel: elements.comfortLevel.value,
            activityLevel: elements.activityLevel.value,
            supervisionRatio: elements.supervisionRatio.value
        };
        
        // Add dimensions based on pool shape
        switch(formData.poolShape) {
            case 'round':
                formData.diameter = parseFloat(elements.diameter.value);
                formData.diameterUnit = elements.diameterUnit.value;
                break;
            case 'rectangular':
                formData.length = parseFloat(elements.length.value);
                formData.lengthUnit = elements.lengthUnit.value;
                formData.width = parseFloat(elements.width.value);
                formData.widthUnit = elements.widthUnit.value;
                break;
            case 'oval':
                formData.majorAxis = parseFloat(elements.majorAxis.value);
                formData.majorAxisUnit = elements.majorAxisUnit.value;
                formData.minorAxis = parseFloat(elements.minorAxis.value);
                formData.minorAxisUnit = elements.minorAxisUnit.value;
                break;
            case 'irregular':
                formData.surfaceArea = parseFloat(elements.surfaceArea.value);
                formData.surfaceAreaUnit = elements.surfaceAreaUnit.value;
                break;
        }
        
        return formData;
    }
    
    /**
     * Calculate pool capacity based on form data
     * @param {Object} formData - Form data object
     * @returns {Object} - Calculation results
     */
    function calculateCapacity(formData) {
        // Convert all dimensions to square feet for consistent calculations
        const surfaceArea = calculateSurfaceArea(formData);
        
        // Determine space requirements based on age groups
        const spacePerPerson = determineSpaceRequirements(formData);
        
        // Calculate capacity
        const recommendedCapacity = Math.floor(surfaceArea / spacePerPerson.recommended);
        const maximumCapacity = Math.floor(surfaceArea / spacePerPerson.minimum);
        
        // Generate safety considerations
        const safetyConsiderations = generateSafetyConsiderations(formData, recommendedCapacity);
        
        // Generate optimization tips
        const optimizationTips = generateOptimizationTips(formData, recommendedCapacity, maximumCapacity);
        
        return {
            surfaceArea: surfaceArea,
            spacePerPerson: spacePerPerson,
            recommendedCapacity: recommendedCapacity,
            maximumCapacity: maximumCapacity,
            safetyConsiderations: safetyConsiderations,
            optimizationTips: optimizationTips
        };
    }
    
    /**
     * Calculate surface area based on pool shape and dimensions
     * @param {Object} formData - Form data object
     * @returns {number} - Surface area in square feet
     */
    function calculateSurfaceArea(formData) {
        let surfaceArea = 0;
        
        switch(formData.poolShape) {
            case 'round':
                // Convert diameter to feet if needed
                let diameter = convertLengthToFeet(formData.diameter, formData.diameterUnit);
                
                // Area of a circle = π * (diameter/2)²
                const radius = diameter / 2;
                surfaceArea = CONVERSION.PI * (radius * radius);
                break;
                
            case 'rectangular':
                // Convert length and width to feet
                let length = convertLengthToFeet(formData.length, formData.lengthUnit);
                let width = convertLengthToFeet(formData.width, formData.widthUnit);
                
                // Area of a rectangle = length * width
                surfaceArea = length * width;
                break;
                
            case 'oval':
                // Convert major and minor axes to feet
                let majorAxis = convertLengthToFeet(formData.majorAxis, formData.majorAxisUnit);
                let minorAxis = convertLengthToFeet(formData.minorAxis, formData.minorAxisUnit);
                
                // Area of an ellipse = π * (major axis/2) * (minor axis/2)
                surfaceArea = CONVERSION.PI * (majorAxis / 2) * (minorAxis / 2);
                break;
                
            case 'irregular':
                // Use provided surface area, converting if needed
                surfaceArea = formData.surfaceArea;
                if (formData.surfaceAreaUnit === 'square-meters') {
                    surfaceArea *= CONVERSION.SQ_METERS_TO_SQ_FEET; // Convert square meters to square feet
                }
                break;
                
            default:
                // Handle unexpected pool shape
                console.error(`Unexpected pool shape: ${formData.poolShape}`);
                surfaceArea = 0;
                break;
        }
        
        return surfaceArea;
    }
    
    /**
     * Convert length to feet based on unit
     * @param {number} length - Length value
     * @param {string} unit - Unit of measurement
     * @returns {number} - Length in feet
     */
    function convertLengthToFeet(length, unit) {
        switch(unit) {
            case 'feet':
                return length;
            case 'meters':
                return length * CONVERSION.METERS_TO_FEET;
            case 'inches':
                return length * CONVERSION.INCHES_TO_FEET;
            case 'cm':
                return length * CONVERSION.CM_TO_FEET;
            default:
                console.error(`Unexpected length unit: ${unit}`);
                return length; // Return original value but log error
        }
    }
    
    /**
     * Determine space requirements based on age groups and comfort level
     * @param {Object} formData - Form data object
     * @returns {Object} - Space requirements object with recommended and minimum values
     */
    function determineSpaceRequirements(formData) {
        // Base space requirements in square feet per person by age group
        let baseSpace = 0;
        
        switch(formData.ageGroups) {
            case 'toddlers':
                baseSpace = SPACE_REQUIREMENTS.TODDLERS;
                break;
            case 'preschoolers':
                baseSpace = SPACE_REQUIREMENTS.PRESCHOOLERS;
                break;
            case 'children':
                baseSpace = SPACE_REQUIREMENTS.CHILDREN;
                break;
            case 'mixed-children':
                baseSpace = SPACE_REQUIREMENTS.MIXED_CHILDREN;
                break;
            case 'family':
                baseSpace = SPACE_REQUIREMENTS.FAMILY;
                break;
            case 'adults':
                baseSpace = SPACE_REQUIREMENTS.ADULTS;
                break;
            default:
                baseSpace = SPACE_REQUIREMENTS.DEFAULT;
                console.error(`Unexpected age group: ${formData.ageGroups}`);
        }
        
        // Adjust for comfort level
        let comfortMultiplier = 1;
        switch(formData.comfortLevel) {
            case 'spacious':
                comfortMultiplier = COMFORT_MULTIPLIERS.SPACIOUS;
                break;
            case 'comfortable':
                comfortMultiplier = COMFORT_MULTIPLIERS.COMFORTABLE;
                break;
            case 'cozy':
                comfortMultiplier = COMFORT_MULTIPLIERS.COZY;
                break;
            case 'packed':
                comfortMultiplier = COMFORT_MULTIPLIERS.PACKED;
                break;
            default:
                comfortMultiplier = COMFORT_MULTIPLIERS.COMFORTABLE;
                console.error(`Unexpected comfort level: ${formData.comfortLevel}`);
        }
        
        // Adjust for activity level
        let activityMultiplier = 1;
        switch(formData.activityLevel) {
            case 'low':
                activityMultiplier = ACTIVITY_MULTIPLIERS.LOW;
                break;
            case 'moderate':
                activityMultiplier = ACTIVITY_MULTIPLIERS.MODERATE;
                break;
            case 'high':
                activityMultiplier = ACTIVITY_MULTIPLIERS.HIGH;
                break;
            default:
                activityMultiplier = ACTIVITY_MULTIPLIERS.MODERATE;
                console.error(`Unexpected activity level: ${formData.activityLevel}`);
        }
        
        // Calculate recommended and minimum space per person
        const recommendedSpace = baseSpace * comfortMultiplier * activityMultiplier;
        const minimumSpace = baseSpace * MIN_SPACE_PERCENTAGE; // Absolute minimum is a percentage of base space
        
        return {
            recommended: recommendedSpace,
            minimum: minimumSpace,
            base: baseSpace
        };
    }
    
    /**
     * Generate safety considerations based on form data and calculated capacity
     * @param {Object} formData - Form data object
     * @param {number} recommendedCapacity - Recommended capacity
     * @returns {Array} - Array of safety considerations
     */
    function generateSafetyConsiderations(formData, recommendedCapacity) {
        const considerations = [];
        
        // Convert pool depth to inches for consistent comparisons
        let depthInInches = formData.poolDepth;
        if (formData.poolDepthUnit === 'feet') {
            depthInInches *= 12;
        } else if (formData.poolDepthUnit === 'meters') {
            depthInInches *= 39.3701;
        } else if (formData.poolDepthUnit === 'cm') {
            depthInInches *= 0.393701;
        }
        
        // Age-specific safety considerations
        if (formData.ageGroups === 'toddlers' || formData.ageGroups === 'preschoolers' || formData.ageGroups === 'mixed-children') {
            considerations.push("Always maintain constant adult supervision with children. Never leave children unattended, even for a moment.");
        }
        
        // Depth-related considerations
        if (depthInInches > 18) {
            considerations.push("This pool's depth exceeds 18 inches. Ensure all children can stand with their heads above water or provide appropriate flotation devices.");
        }
        
        // Supervision-related considerations
        if (formData.supervisionRatio === 'high') {
            considerations.push("You've selected a high supervision ratio (1 adult per 1-2 children). This is ideal for younger children and ensures optimal safety.");
        } else if (formData.supervisionRatio === 'medium') {
            considerations.push("You've selected a medium supervision ratio (1 adult per 3-4 children). Ensure adults can maintain visual contact with all children at all times.");
        } else if (formData.supervisionRatio === 'low') {
            considerations.push("You've selected a low supervision ratio (1 adult per 5+ children). This is only appropriate for older children with swimming experience.");
        }
        
        // Capacity-related considerations
        if (recommendedCapacity < 2) {
            considerations.push("This pool is very small and best suited for 1-2 users at a time. Avoid overcrowding to prevent accidents.");
        } else if (recommendedCapacity > 10) {
            considerations.push("With a high capacity pool, consider implementing a rotation system or designated zones to maintain safety.");
        }
        
        // Activity-related considerations
        if (formData.activityLevel === 'high') {
            considerations.push("High activity levels increase the risk of slipping. Consider adding non-slip mats around the pool area.");
        }
        
        // General safety considerations
        considerations.push("Establish and enforce clear pool rules to prevent running, pushing, or rough play.");
        considerations.push("Keep rescue equipment (such as a reaching pole) nearby whenever the pool is in use.");
        
        return considerations;
    }
    
    /**
     * Generate optimization tips based on form data and calculated capacity
     * @param {Object} formData - Form data object
     * @param {number} recommendedCapacity - Recommended capacity
     * @param {number} maximumCapacity - Maximum capacity
     * @returns {Array} - Array of optimization tips
     */
    function generateOptimizationTips(formData, recommendedCapacity, maximumCapacity) {
        const tips = [];
        
        // Capacity optimization
        if (maximumCapacity - recommendedCapacity > 2) {
            tips.push("You can increase capacity from " + recommendedCapacity + " to " + maximumCapacity + " people by selecting a 'cozy' comfort level, but this may reduce overall enjoyment.");
        }
        
        // Activity optimization
        if (formData.activityLevel === 'high') {
            tips.push("Consider implementing 'activity zones' to separate active play from calmer areas, maximizing the use of space.");
        }
        
        // Age group optimization
        if (formData.ageGroups === 'family' || formData.ageGroups === 'mixed-children') {
            tips.push("For mixed age groups, consider scheduling 'age-specific' swim times to optimize capacity and enjoyment.");
        }
        
        // Pool type specific tips
        if (formData.poolType === 'inflatable') {
            tips.push("Inflatable pools can be adjusted to different depths. Lower water levels can accommodate more people safely, especially for younger children.");
        } else if (formData.poolType === 'framed') {
            tips.push("Frame pools typically offer more stability for active play. Consider adding pool noodles as lane dividers for organized activities.");
        }
        
        // General optimization tips
        tips.push("Rotate users in 30-minute sessions during hot days or parties to accommodate more people throughout the day.");
        tips.push("Remove unnecessary floating toys and equipment when maximum capacity is needed.");
        
        return tips;
    }
    
    /**
     * Display calculation results
     * @param {Object} results - Calculation results
     */
    function displayResults(results) {
        // Show results section
        elements.resultsSection.style.display = 'block';
        
        // Display capacity numbers
        elements.recommendedCapacity.textContent = results.recommendedCapacity + ' people';
        elements.maximumCapacity.textContent = results.maximumCapacity + ' people';
        
        // Display surface area
        elements.poolSurfaceArea.textContent = results.surfaceArea.toFixed(2) + ' sq ft';
        
        // Display space per person
        elements.spacePerPerson.textContent = results.spacePerPerson.recommended.toFixed(2) + ' sq ft per person (recommended)';
        
        // Display safety considerations
        elements.safetyConsiderations.innerHTML = '';
        results.safetyConsiderations.forEach(consideration => {
            const li = document.createElement('li');
            li.textContent = consideration;
            elements.safetyConsiderations.appendChild(li);
        });
        
        // Display optimization tips
        elements.optimizationTips.innerHTML = '';
        results.optimizationTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            elements.optimizationTips.appendChild(li);
        });
        
        // Generate visual representation
        generateCapacityVisualization(results);
    }
    
    /**
     * Generate visual representation of pool capacity
     * @param {Object} results - Calculation results
     */
    function generateCapacityVisualization(results) {
        // Clear previous visualization
        elements.capacityVisualization.innerHTML = '';
        
        // Create pool shape container
        const poolContainer = document.createElement('div');
        poolContainer.className = 'pool-visualization';
        
        // Add pool shape class based on form data
        poolContainer.classList.add('pool-shape-' + elements.poolShapeSelect.value);
        
        // Create person icons based on recommended capacity
        const personContainer = document.createElement('div');
        personContainer.className = 'person-container';
        
        // Limit visual representation to a reasonable number
        const visualCapacity = Math.min(results.recommendedCapacity, MAX_VISUAL_ICONS);
        
        for (let i = 0; i < visualCapacity; i++) {
            const personIcon = document.createElement('div');
            personIcon.className = 'person-icon';
            personIcon.innerHTML = '<span>👤</span>';
            personContainer.appendChild(personIcon);
        }
        
        // If actual capacity is higher than visual representation, add note
        if (results.recommendedCapacity > 20) {
            const note = document.createElement('p');
            note.className = 'visualization-note';
            note.textContent = '+ ' + (results.recommendedCapacity - 20) + ' more people';
            personContainer.appendChild(note);
        }
        
        // Add person container to pool container
        poolContainer.appendChild(personContainer);
        
        // Add pool container to visualization element
        elements.capacityVisualization.appendChild(poolContainer);
        
        // Add capacity legend
        const legend = document.createElement('div');
        legend.className = 'visualization-legend';
        legend.innerHTML = `
            <p><span class="legend-icon">👤</span> = 1 person</p>
            <p>Recommended: ${results.recommendedCapacity} people</p>
            <p>Maximum: ${results.maximumCapacity} people</p>
        `;
        elements.capacityVisualization.appendChild(legend);
    }
    
    /**
     * Scroll to results section
     */
    function scrollToResults() {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    /**
     * Set up ARIA attributes for accessibility
     */
    function setupAccessibility() {
        // Set up error container as live region
        elements.errorContainer.setAttribute('role', 'alert');
        elements.errorContainer.setAttribute('aria-live', 'assertive');
        
        // Set up results section as live region
        elements.resultsSection.setAttribute('aria-live', 'polite');
        
        // Add descriptive labels to form controls
        elements.form.querySelectorAll('select, input').forEach(element => {
            // Add null check to prevent errors if label is not found
            const label = element.closest('.form-group')?.querySelector('label');
            if (label) {
                // Only set aria-labelledby if we don't already have a proper label association
                // Check if the label's 'for' attribute matches the element's id
                if (!label.getAttribute('for') || label.getAttribute('for') !== element.id) {
                    const labelId = `${element.id}-label`;
                    label.id = labelId;
                    element.setAttribute('aria-labelledby', labelId);
                }
            }
        });
    }
    
    // Initialize the calculator
    initEventListeners();
    setupAccessibility();
});
