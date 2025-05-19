Okay, here's a detailed breakdown of the fields for each of your 15 kiddie pool calculators, designed with simplicity and the needs of your target consumers (parents/caregivers) in mind.

**General Considerations for All Calculators:**

- **Language:** Use simple, clear, and friendly language. Avoid technical jargon.
- **Units:** Offer choices between "Feet/Inches" and "Meters/Centimeters." Default to what's most common for your primary audience (e.g., Feet/Inches for the US, Meters/Centimeters for Europe/India). The output units should also be selectable (e.g., Gallons/Liters). For India, Meters/Centimeters and Liters would be good defaults.
- **Input Types:**
    - `Dropdown`: For selecting from a predefined list (e.g., pool shape, units).
    - `Number`: For numerical input (e.g., length, width, depth). Specify if integers or decimals are allowed. For simplicity, whole numbers or simple decimals (.5) are usually sufficient for kiddie pools.
    - `Checkbox`: For yes/no options or selecting multiple items.
    - `Text (output)`: For displaying results and notes.
- **Visuals:** Use simple icons next to shape selections or to illustrate measurements where possible.
- **Help Text/Tooltips:** Provide brief explanations for fields if they might be unclear (e.g., "Measure inside width," "Desired water depth, not pool wall height").
- **Safety Notes & Disclaimers:** Integrate these directly into the output of relevant calculators.
- **Mobile-First Design:** Ensure inputs are large enough and easy to tap on a smartphone.

---

Here are the detailed fields for each calculator:

**1. Pool Volume Calculator (or Water Capacity Calculator)**

- **Goal:** Calculate the amount of water the pool holds.
- **User Need:** Knowing how much water to fill, understanding water usage, basis for other calculations.
- **Input Fields:**
    - `pool_shape`: Dropdown (with icons if possible)
        - Options: "Round / Circular", "Rectangular / Square", "Oval"
        - Help Text: "Select the shape that best matches your kiddie pool."
    - `measurement_units`: Dropdown
        - Options: "Feet & Inches", "Meters & Centimeters" (Default: "Meters & Centimeters")
    - **Conditional Fields based on `pool_shape`:**
        - **If "Round / Circular":**
            - `diameter_m` (if Meters/CM): Number (e.g., "1.5" for 1 meter 50 cm) | `diameter_ft`, `diameter_in` (if Feet/Inches): Number
            - Help Text: "Measure the widest distance across the inside of the pool."
        - **If "Rectangular / Square":**
            - `length_m` / `length_ft`, `length_in`: Number
            - `width_m` / `width_ft`, `width_in`: Number
            - Help Text: "Measure the inside length and width."
        - **If "Oval":**
            - `long_diameter_m` / `long_diameter_ft`, `long_diameter_in`: Number (Longest distance across)
            - `short_diameter_m` / `short_diameter_ft`, `short_diameter_in`: Number (Shortest distance across the center)
            - Help Text: "Measure the longest and shortest distances across the inside of the oval."
    - `water_depth_cm` / `water_depth_in`: Number
        - Help Text: "How deep do you plan to fill the water? (e.g., 30 cm or 12 inches). This is not the height of the pool wall."
    - `output_volume_units`: Dropdown
        - Options: "Liters", "US Gallons" (Default: "Liters")
- **Output Fields:**
    - `calculated_volume`: Text (e.g., "Your pool holds approximately: **150 Liters**")
    - `notes`: Text (e.g., "Tip: Measure inside dimensions for accuracy. This is an estimate.")

---

**2. Pool Surface Area Calculator**

- **Goal:** Calculate the area of the water's surface.
- **User Need:** Useful for some cover considerations or understanding sun exposure.
- **Input Fields:**
    - `pool_shape`: (Same as Calculator 1)
    - `measurement_units`: (Same as Calculator 1)
    - **Dimensional Inputs (Same as Calculator 1, _excluding `water_depth`_):** `diameter_m` / `diameter_ft`, `diameter_in`, `length_m` / `length_ft`, `length_in`, etc.
    - `output_area_units`: Dropdown
        - Options: "Square Meters", "Square Feet" (Default: "Square Meters")
- **Output Fields:**
    - `calculated_surface_area`: Text (e.g., "The water surface area is approximately: **1.77 Square Meters**")
    - `notes`: Text (e.g., "This is the area of the top of the water.")

---

**3. Pool Perimeter Calculator**

- **Goal:** Calculate the distance around the edge of the pool.
- **User Need:** Planning for a small fence, edging, or storage.
- **Input Fields:**
    - `pool_shape`: (Same as Calculator 1)
    - `measurement_units`: (Same as Calculator 1)
    - **Dimensional Inputs (Same as Calculator 1, _excluding `water_depth`_)**
    - `output_length_units`: Dropdown
        - Options: "Meters", "Feet" (Default: "Meters")
- **Output Fields:**
    - `calculated_perimeter`: Text (e.g., "The distance around your pool is approximately: **4.7 Meters**")

---

**4. Irregular Shape Surface Area Calculator**

- **Goal:** Estimate surface area for non-standard pool shapes (e.g., a cartoon character).
- **User Need:** A rough idea of size for oddly shaped pools.
- **Method (Average Dimensions - Simplest):**
    - **Input Fields:**
        - `measurement_units`: (Same as Calculator 1)
        - `overall_length_m` / `overall_length_ft`, `overall_length_in`: Number
            - Help Text: "Measure the longest possible straight line across your pool's surface."
        - `average_width_m` / `average_width_ft`, `average_width_in`: Number
            - Help Text: "Estimate the average width across the pool. (e.g., if it's wider in the middle and narrow at ends, take a mental average)."
        - `output_area_units`: (Same as Calculator 2)
    - **Output Fields:**
        - `estimated_surface_area`: Text (e.g., "Estimated irregular surface area: **2.1 Square Meters**")
        - `notes`: Text (e.g., "This is a rough estimate for unusually shaped pools. For a very rough volume, multiply this area by your desired water depth.")
- **Alternative Method (Sectioning - More advanced, offer as an option if feasible):**
    - Guide users to break the shape into 2-3 simple shapes (rectangles, circles), calculate their areas (linking to Calc 2), and then sum them.

---

**5. Simplified Chemical Dosage Calculator**

- **Goal:** EXTREMELY basic, safe advice, prioritizing water changes.
- **User Need:** Guidance on keeping water fresh or cleaning the empty pool. **This is NOT for complex chemical balancing.**
- **Input Fields:**
    - `pool_volume_liters` / `pool_volume_gallons`: Number (Can pre-fill if user navigates from Calc 1)
        - Help Text: "Enter your pool's water volume."
    - `what_do_you_want_to_do`: Dropdown
        - Options:
            - "Advice for keeping water fresh"
            - "Clean my EMPTY kiddie pool"
            - (Cautiously, if at all): "Basic sanitizing (use with extreme care & product label)"
- **Output Fields (Conditional on `what_do_you_want_to_do`):**
    - **If "Advice for keeping water fresh":**
        - `recommendation_title`: Text ("Keeping Kiddie Pool Water Fresh")
        - `recommendation_details`: Text ("For a pool of **[Pool Volume] Liters/Gallons**, the safest way to keep water fresh for young children is to: \n1. Empty the pool daily or at least every other day. \n2. Scrub the empty pool with mild soap and rinse well. \n3. Refill with fresh tap water. \nRegularly changing water is better than relying on chemicals for small kiddie pools.")
    - **If "Clean my EMPTY kiddie pool":**
        - `cleaning_agent`: Dropdown
            - Options: "Mild Dish Soap", "Diluted White Vinegar (for hard water spots)"
        - `recommendation_title`: Text (e.g., "Cleaning with Mild Dish Soap")
        - `recommendation_details`: Text (e.g., "For your **[Pool Volume] Liters/Gallons** pool (when empty): \n1. Mix about 1 teaspoon (5ml) of mild dish soap per 4 Liters (or 1 US Gallon) of warm water. \n2. Gently scrub all inside surfaces. \n3. **Rinse VERY thoroughly** multiple times with fresh water to remove all soap before refilling. Soap residue can irritate skin and eyes.")
    - **If "Basic sanitizing...":** (USE WITH EXTREME CAUTION AND MANY DISCLAIMERS)
        - `recommendation_title`: Text ("Basic Sanitizing - IMPORTANT INFORMATION")
        - `recommendation_details`: Text ("**WARNING: Chemical use in small kiddie pools is generally NOT recommended due to the high risk of incorrect dosage and potential harm to children. Frequent water changes are SAFER.**\nIf you choose to use a sanitizer, ONLY use products specifically labeled as safe for kiddie pools or small inflatable pools. \n**ALWAYS read and meticulously follow the product manufacturer's instructions on the label.** Dosage will be based on your pool volume of **[Pool Volume] Liters/Gallons** and the specific product concentration. \nNEVER guess amounts. Use accurate measuring tools. Test water if using sanitizers. Keep children away during chemical addition and ensure proper mixing/waiting times per product label.")
    - `SAFETY_DISCLAIMER_MAIN`: **PROMINENT TEXT (Always Visible)**
        - "**Safety First!** Kiddie pools are for fun, but water safety is serious. Always supervise children closely around water. Empty kiddie pools when not in use. For water quality, frequent emptying and refilling with fresh water is often the safest and easiest method for small pools."

---

**6. Water Evaporation Estimator (Simplified)**

- **Goal:** Give a rough idea of water loss.
- **User Need:** Understanding why water level drops.
- **Input Fields:**
    - `pool_surface_area_sq_m` / `pool_surface_area_sq_ft`: Number (From Calc 2 or manual)
    - `weather_conditions`: Dropdown
        - Options: "Hot, Sunny & Windy Day", "Warm, Sunny & Calm Day", "Mild & Cloudy Day"
    - `time_period`: Dropdown
        - Options: "Per Day", "Over 3 Days"
    - `output_volume_units`: (Same as Calc 1, default "Liters")
- **Output Fields:**
    - `estimated_evaporation`: Text (e.g., "Your pool might lose roughly **5-10 Liters** of water per day due to evaporation under these conditions.")
    - `notes`: Text ("This is a very rough estimate. Using a pool cover when not in use significantly reduces evaporation.")

---

**7. Pool Cover Size Calculator**

- **Goal:** Recommend a cover size.
- **User Need:** Buying the right size cover.
- **Input Fields:**
    - `pool_shape`: (Same as Calculator 1)
    - `measurement_units`: (Same as Calculator 1)
    - **Dimensional Inputs (Same as Calculator 1, _excluding `water_depth`_)**
    - `desired_overlap_cm` / `desired_overlap_in`: Number (e.g., Default: 15 cm or 6 inches)
        - Help Text: "How much extra do you want the cover to hang over the edge on each side?"
- **Output Fields:**
    - `recommended_cover_dimensions`: Text (e.g., "For your Round pool, look for a cover at least **[Calculated Diameter] Meters/Feet** across.", "For your Rectangular pool, aim for a cover around **[Calc. Length] x [Calc. Width] Meters/Feet**.")
    - `notes`: Text ("It's usually better to have a cover slightly larger. Check the cover manufacturer's sizing guide too.")

---

**8. Shade Coverage Calculator**

- **Goal:** Estimate area shaded by an umbrella or sail.
- **User Need:** Planning sun protection.
- **Input Fields:**
    - `shade_provider_type`: Dropdown
        - Options: "Round Umbrella", "Square/Rectangular Umbrella/Sail", "Triangular Sail"
    - `measurement_units`: (Same as Calculator 1)
    - **Conditional Fields:**
        - **If "Round Umbrella":**
            - `umbrella_diameter_m` / `umbrella_diameter_ft`: Number
        - **If "Square/Rectangular Umbrella/Sail":**
            - `shade_length_m` / `shade_length_ft`: Number
            - `shade_width_m` / `shade_width_ft`: Number
        - **If "Triangular Sail":** (Simplified - base & height)
            - `sail_base_m` / `sail_base_ft`: Number
            - `sail_height_m` / `sail_height_ft`: Number (Perpendicular height to the base)
    - `output_area_units`: (Same as Calculator 2)
- **Output Fields:**
    - `estimated_shade_patch_area`: Text (e.g., "Provides roughly **2.5 Square Meters** of shade directly underneath at midday.")
    - `notes`: Text ("Remember, the shaded area will move as the sun moves. This estimates the shade when the sun is relatively high. Consider the sun's path for all-day coverage.")

---

**9. Water Usage Estimator (for filling)**

- **Goal:** Reiterate water volume for filling, potentially add fill time.
- **User Need:** How much water, how long to fill.
- **Input Fields:**
    - _(Identical to Calculator 1: `pool_shape`, `measurement_units`, dimensional inputs, `water_depth_cm`/`in`, `output_volume_units`)_
    - `add_fill_time_estimate`: Checkbox ("Estimate how long it might take to fill?")
    - **Conditional Fields if `add_fill_time_estimate` is checked:**
        - `hose_flow_rate_assumption`: Dropdown
            - Options: "Typical Garden Hose (approx. 20 Liters/min or 5 Gallons/min)", "Lower Flow Hose (approx. 10 Liters/min or 2.5 Gallons/min)", "I will enter custom rate"
        - `custom_flow_rate_lpm` / `custom_flow_rate_gpm`: Number (if custom selected)
- **Output Fields:**
    - `water_needed_to_fill`: Text (Same as Calc 1 output: "You'll need approximately: **150 Liters**")
    - **Conditional Output if fill time estimated:**
        - `estimated_fill_time`: Text (e.g., "At around 20 Liters/minute, it may take approximately **7-8 minutes** to fill.")
    - `notes`: Text ("Fill times are estimates and vary based on your actual water pressure and hose.")

---

**10. Pool & Basic Accessories Cost Estimator**

- **Goal:** Rough idea of initial setup cost.
- **User Need:** Budgeting for a new kiddie pool.
- **Input Fields:**
    - `currency`: Dropdown (e.g., "INR (₹)", "USD ($)", "EUR (€)", "GBP (£)") (Default: "INR (₹)")
    - `estimated_pool_cost`: Number
        - Help Text: "Enter the approximate cost of the kiddie pool itself."
    - **Accessories (Checkboxes with optional `Number` input fields for cost if user wants to include them):**
        - `include_cover`: Checkbox -> `cover_cost`: Number (Optional)
        - `include_ground_mat`: Checkbox -> `ground_mat_cost`: Number (Optional)
        - `include_small_pump_filter` (if applicable): Checkbox -> `pump_filter_cost`: Number (Optional)
        - `include_cleaning_net_brush`: Checkbox -> `cleaning_tools_cost`: Number (Optional)
        - `include_basic_toys`: Checkbox -> `toys_cost`: Number (Optional)
        - `include_sun_shade_option`: Checkbox -> `sun_shade_cost`: Number (Optional)
- **Output Fields:**
    - `total_estimated_initial_cost`: Text (e.g., "Rough estimated initial cost: **₹[Calculated Total]**")
    - `cost_breakdown_notes`: Text ("Includes pool cost of ₹[Pool Cost]. Add costs for selected accessories. This is a basic estimate; actual prices vary.")
    - `disclaimer`: Text ("Prices are estimates and vary greatly by brand, store, and sales. Sales tax not included.")

---

**11. Basic Upkeep Cost Estimator (water, simple supplies)**

- **Goal:** Estimate ongoing seasonal/monthly costs.
- **User Need:** Budgeting for using the pool.
- **Input Fields:**
    - `currency`: (Same as Calculator 10)
    - `pool_volume_liters` / `pool_volume_gallons`: Number (From Calc 1)
    - `refill_frequency`: Dropdown
        - Options: "Every 2 days", "Once a week", "Twice a month"
    - `cost_per_1000_liters_water` / `cost_per_100_gallons_water`: Number
        - Help Text: "Check your utility bill for water cost, or use a local average if unsure (this is a major variable)." (Provide a field for a small unit like cost per liter/gallon if easier for user).
    - `months_of_use_per_year`: Number (e.g., "3")
    - `monthly_cost_cleaning_supplies`: Number (Optional, for mild soap etc.)
        - Help Text: "Small estimate for things like mild soap for cleaning."
    - `monthly_cost_kiddie_safe_treatment` (if user plans this, with caution): Number (Optional)
- **Output Fields:**
    - `estimated_monthly_water_cost`: Text (e.g., "Estimated monthly water cost: **₹[Calc. Cost]**")
    - `estimated_monthly_supplies_cost`: Text
    - `total_estimated_monthly_upkeep`: Text
    - `total_estimated_seasonal_upkeep`: Text (Monthly x `months_of_use_per_year`)
    - `notes`: Text ("Water costs are a primary factor and vary widely. Electricity for a pump (if used) is not included.")

---

**12. Child Safe Play Area Planner/Calculator**

- **Goal:** Advise on clear space around the pool.
- **User Need:** Ensuring a safe environment.
- **Input Fields:**
    - `measurement_units`: (Same as Calculator 1)
    - `pool_longest_dimension_m` / `pool_longest_dimension_ft`: Number (e.g., length or diameter)
    - `pool_widest_dimension_m` / `pool_widest_dimension_ft`: Number (e.g., width or diameter)
    - `desired_clear_zone_cm` / `desired_clear_zone_ft`: Number (Default: 100 cm or 3 feet)
        - Help Text: "Recommended clear, unobstructed space around all sides of the pool."
- **Output Fields:**
    - `total_safe_area_needed_length`: Text (e.g., "You'll need a total flat area of about: **[Calc. Length] Meters/Feet** long")
    - `total_safe_area_needed_width`: Text (e.g., "and **[Calc. Width] Meters/Feet** wide.")
    - `diagram_suggestion`: Text ("(Consider showing a simple diagram of a pool with the clear zone highlighted).")
    - `safety_checklist_title`: Text ("Safe Zone Checklist:")
    - `safety_checklist_items`: Bulleted List
        - "Area is flat and level."
        - "Free of sharp objects (stones, sticks, glass)."
        - "Surface is non-slip (e.g., grass, not slick concrete)."
        - "No electrical items/cords nearby."
        - "Pool is easily visible for supervision."
        - "Away from hazards like roads or drops."

---

**13. Child Water Depth Appropriateness Checker (based on age)**

- **Goal:** Guide on safe water depths for young children.
- **User Need:** Peace of mind about water depth.
- **Input Fields:**
    - `child_age`: Dropdown
        - Options: "6-12 Months (Infant - needs full support)", "1-2 Years (Toddler)", "3-4 Years (Preschooler)"
    - `planned_water_depth_cm` / `planned_water_depth_in`: Number
        - Help Text: "The actual depth of water you plan to have in the pool."
- **Output Fields (Conditional on `child_age`):**
    - `depth_advice_title`: Text (e.g., "Water Depth Advice for a 1-2 Year Old Toddler")
    - `depth_assessment_message`: Text (e.g., "For a toddler (1-2 years), a water depth of **[Planned Depth] cm/inches** means: [Specific advice based on typical toddler size – e.g., 'This depth should allow them to sit comfortably with head well above water. Ensure they can also stand and move easily if they try.' or 'This depth might be too high for comfortable sitting/standing; consider reducing.']")
        - **General Guidelines to incorporate:**
            - Infants: Only a few inches/cm (enough for splashing with constant adult support).
            - Toddlers: Shallow enough to sit with head clear, or stand easily (e.g., below chest when seated).
            - Preschoolers: Generally not exceeding waist/mid-chest when standing.
    - `SUPERVISION_WARNING_CRITICAL`: **PROMINENT TEXT (Always Visible)**
        - "**DANGER! Constant, Active, Undistracted Adult Supervision within Arm's Reach is ABSOLUTELY ESSENTIAL whenever children are in or near ANY water, regardless of depth. Drowning can happen silently and in seconds.**"
    - `additional_safety_tips`: Text ("Always empty kiddie pools immediately after use. Learn CPR.")

---

**14. Kiddie Pool Capacity Calculator (how many children)**

- **Goal:** Very rough guideline for comfortable play.
- **User Need:** Avoiding overcrowding.
- **Input Fields:**
    - `pool_surface_area_sq_m` / `pool_surface_area_sq_ft`: Number (From Calc 2 or manual)
    - `children_age_group_playing`: Dropdown
        - Options: "Mostly Toddlers (1-2 years)", "Mostly Preschoolers (3-4 years)"
    - `expected_activity_level`: Dropdown
        - Options: "Gentle splashing, sitting", "More active play, some toys"
- **Output Fields:**
    - `estimated_comfortable_capacity`: Text (e.g., "For gentle splashing, this pool might comfortably fit **1-2 toddlers**." or "For more active play, consider **1 preschooler** to allow space.")
    - `capacity_notes`: Text ("This is a guideline for comfort and safe play, not a strict limit. Fewer children often means safer and more enjoyable play. Ensure enough space to avoid bumps and allow easy movement.")
    - `SUPERVISION_WARNING`: (Same as #13 or slightly adapted) "**Always supervise actively! Overcrowding increases risk.**"
- **Considerations:** Use very conservative numbers. E.g., 1.5-2 sq meters (15-20 sq ft) per child for _active_ play might be a starting point for logic, but then present it as a very small number of children.

---

**15. Water Warming Time Estimator (Simplified, e.g., based on sun exposure)**

- **Goal:** Rough idea if/when water might get a bit warmer.
- **User Need:** Setting expectations for water temperature.
- **Input Fields:**
    - `pool_volume_liters_gallons_category`: Dropdown
        - Options: "Small (e.g., under 200 Liters / 50 Gal)", "Medium (e.g., 200-500 Liters / 50-130 Gal)", "Large (e.g., over 500 Liters / 130 Gal)"
    - `current_water_feel`: Dropdown
        - Options: "Feels very cold (fresh from tap)", "Feels cool", "Feels slightly cool"
    - `sun_exposure_level`: Dropdown
        - Options: "Full direct sunlight", "Partly sunny / some clouds", "Mostly shady / overcast"
    - `outside_air_temp_feel`: Dropdown
        - Options: "Cool Day (below 18°C / 65°F)", "Mild Day (18-24°C / 65-75°F)", "Warm Day (25-30°C / 76-86°F)", "Hot Day (above 30°C / 86°F)"
- **Output Fields:**
    - `warming_time_estimate_message`: Text (e.g., "With full sun on a warm day, your [Small] pool might feel noticeably warmer in **1-2 hours**." or "In mostly shady conditions, the water may not warm up much today.")
    - `warming_tips`: Text ("Tips to help warm the water: \n- Use a dark-colored pool if possible. \n- Place a dark tarp under the pool. \n- A solar cover (even clear bubble wrap) can trap heat. \n- Ensure the pool is in the sunniest spot. \n- Shallower water warms faster.")
    - `notes`: Text ("This is a very rough estimate. Actual warming depends on many factors like wind, pool color, and exact temperatures.")

