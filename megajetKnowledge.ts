import { COMPREHENSIVE_PARTS_LIST } from './equipmentParts';

export const PECOFOODS_KNOWLEDGE_BASE = [
  {
    "id": "meta-1",
    "type": "meta",
    "title": "PecoFoods Pochanatas Megajet & Grasselli Knowledgebase for Poultry Processing",
    "created_at": "2025-09-22T00:00:00Z",
    "description": "Comprehensive troubleshooting, programs, procedures, and training content for PecoFoods Pochanatas. Facility Layout: 6 Production Lines. Each line consists of 1 Grasselli Slicer (KSL-CBU/4) in front of 1 MegaJet Waterjet Cutter (8-cutter, 2-lane). Specializing in McDonald's and Buffalo Wild Wings poultry products."
  },
  {
    "id": "facility-layout",
    "type": "layout",
    "title": "Facility Asset Overview",
    "description": "The Pochanatas facility operates 6 identical production lines (Line 1 through Line 6).",
    "configuration": [
      "6x MegaJet™ Waterjet Systems (8 cutters each, 2 lanes)",
      "6x Grasselli Slicers (KSL-CBU/4) positioned directly in-feed of each MegaJet",
      "Total Facilty Capacity: 48 high-pressure cutting arms."
    ]
  },
  {
    "id": "comprehensive-parts-registry",
    "type": "parts_registry",
    "title": "Global Component Master List",
    "parts": COMPREHENSIVE_PARTS_LIST
  },
  {
    "id": "system-spec-megajet",
    "type": "system_specification",
    "title": "MegaJet™ System Specifications",
    "affected_system": "Megajet",
    "details": {
      "model": "MegaJet™",
      "cutters": "Eight (8) X-Y cutters, the company's highest-volume water cutter.",
      "lanes": "Operates on two production lanes.",
      "operating_system": "Windows 10 with True Cutting Software.",
      "features": [
        "Integrated high-pressure pump",
        "Camera vision system"
      ]
    }
  },
  {
    "id": "system-spec-grasselli",
    "type": "system_specification",
    "title": "Grasselli System Specifications",
    "affected_system": "Grassilli",
    "details": {
      "model": "KSL-CBU/4",
      "type": "Horizontal Slicer"
    }
  },
  {
    "id": "program-mccrispy-fillet",
    "type": "program",
    "program_name": "McCrispy Fillet",
    "details": {
      "in_house_target_weight_g": 95,
      "shipping_target_weight_g": 98,
      "target_thickness_mm_variance": [13.5, 14.5],
      "notes": "Primary program for McDonald's McCrispy. Critical to maintain thickness for cooking consistency. The vision system is optimized for whole breast muscle shape."
    }
  },
  {
    "id": "program-mcstrips",
    "type": "program",
    "program_name": "McNugget Strips",
    "details": {
      "in_house_target_weight_g": 44,
      "shipping_target_weight_g": 46,
      "target_thickness_mm": 19,
      "notes": "Used for McDonald's strips. Operators must check for uniform thickness and width, as this affects breading pickup."
    }
  },
  {
    "id": "program-bww-boneless",
    "type": "program",
    "program_name": "BWW Boneless Wings",
    "details": {
      "target_weight_g": 20,
      "target_thickness_mm": null,
      "notes": "Also known as 'All Chunks.' No base thickness target; relies heavily on the vision system and correct density setting. Operator must monitor weights frequently due to product variability."
    }
  },
  {
    "id": "program-bww-strips",
    "type": "program",
    "program_name": "BWW Strips",
    "details": {
      "target_weight_g": 52,
      "target_thickness_mm": 18,
      "notes": "Buffalo Wild Wings tenderloin strips. Watch feed alignment when switching from McNugget Strips due to thickness difference."
    }
  },
  {
    "id": "program-bww-fillets",
    "type": "program",
    "program_name": "BWW Fillets",
    "details": {
      "target_weight_g": 110,
      "target_thickness_mm": 15,
      "notes": "Larger fillet product for Buffalo Wild Wings. Ensure full coverage by the vision system camera."
    }
  },
  {
    "id": "density-calculation-logic",
    "type": "calculation_logic",
    "title": "HMI Density Setting Calculation for Poultry",
    "description": "The 'density' setting on the Megajet HMI is a critical software parameter that tells the vision system how to interpret the volume of an incoming piece of poultry to achieve a precise target weight. It is NOT the physical density of the meat, but a calibration factor. A higher density setting tells the machine the poultry is 'heavier' for its size, causing it to make smaller cuts. A lower setting tells the machine the poultry is 'lighter,' resulting in larger cuts.",
    "formula_principles": {
      "base_density": 1.06,
      "concept": "The calculation starts with a base density for poultry (1.06 g/cm^3) and adjusts it based on product-specific factors and machine speed.",
      "factors": [
        {
          "parameter": "Product Type",
          "effect": "Different products have different 'form factors' or expected water/fat content, which requires an adjustment. 'McCrispy Fillet' is the baseline (x1.0). 'BWW Boneless Wings' are highly variable and less uniform, requiring a lower starting density factor to compensate (x0.98). Strips are more uniform (x1.02)."
        },
        {
          "parameter": "Target Weight",
          "effect": "Heavier target weights generally mean less cutting is needed per piece, making the process more tolerant of density variations. This has a minor inverse effect on the required setting."
        },
        {
          "parameter": "Average Thickness",
          "effect": "Thicker poultry is often less dense (more water content). The formula must compensate by slightly lowering the density setting for thicker products."
        },
        {
          "parameter": "Belt Speed",
          "effect": "Higher belt speeds give the vision system less time to scan, potentially underestimating volume. A slightly higher density setting is needed to compensate for this at higher speeds."
        }
      ]
    },
    "example_calculation_steps": [
      "1. Start with base poultry density (1.06).",
      "2. Apply a product-specific multiplier (e.g., 1.0 for McCrispy, 0.98 for BWW Boneless).",
      "3. Apply a small adjustment factor based on thickness (e.g., thicker product = slightly lower density).",
      "4. Apply a small adjustment factor for belt speed (e.g., faster belt = slightly higher density).",
      "5. The final result is the number to be entered into the HMI's 'Density' field."
    ]
  },
  {
    "id": "issue-actuator-error",
    "type": "troubleshooting",
    "title": "Actuator Error / Actuator Not Responding",
    "affected_system": "Megajet - actuator",
    "symptoms": [
      "Actuator fault lights",
      "Actuator not moving",
      "Error codes (e.g., A12, A21) on control panel",
      "Inconsistent cutting height or missed cuts"
    ],
    "likely_causes": [
      "Loose actuator electrical connector",
      "Low hydraulic or pneumatic supply",
      "Actuator motor failure",
      "Control board output channel failure",
      "Software/firmware glitch"
    ],
    "diagnostics": [
      "Check the actuator status LED on the actuator unit and control panel.",
      "Confirm power and signal cables are fully seated and free from damage.",
      "Check hydraulic/pneumatic supply pressures and verify within spec.",
      "Attempt a manual actuator move from the PLC or HMI diagnostic screen.",
      "Review recent error codes in the machine alarm/history."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Stop production in the affected lane(s) and lock out/tag out if repair requires access to moving parts.",
        "rationale": "Safety before any physical intervention."
      },
      {
        "step": 2,
        "priority": "high",
        "action": "Check actuator electrical connectors at both actuator and control panel — re-seat all connectors.",
        "rationale": "Loose connectors are a common fast fix."
      },
      {
        "step": 3,
        "priority": "medium",
        "action": "Check hydraulic/pneumatic pressure at the gauge, compare to spec. If pressure is below spec, inspect supply lines and pump.",
        "rationale": "Actuator may not move under low supply pressure."
      },
      {
        "step": 4,
        "priority": "medium",
        "action": "Attempt a manual test move via HMI/diagnostics. If actuator moves, run a controlled test cut to confirm return to spec.",
        "rationale": "Verify whether problem is mechanical or intermittent."
      },
      {
        "step": 5,
        "priority": "low",
        "action": "If actuator motor is suspected failed, escalate to maintenance for replacement and log part order.",
        "rationale": "Requires parts and scheduled downtime."
      }
    ],
    "tools_and_parts": [
      "Multimeter",
      "Appropriate wrenches for connector access",
      "Replacement actuator (spare)",
      "Hydraulic/pneumatic pressure tester"
    ],
    "severity": "major",
    "operator_action": "Follow steps 1–4; if unresolved, escalate and continue production on alternate lane if possible.",
    "admin_escalation": "If step 4 fails, create a maintenance ticket and notify maintenance lead; log in troubleshooting database with photos."
  },
  {
    "id": "issue-water-pressure-anomaly",
    "type": "troubleshooting",
    "title": "Low or Fluctuating Water Pressure",
    "affected_system": "Megajet - water supply",
    "symptoms": [
      "Cuts are inconsistent or underweight",
      "Pressure gauge reads low or fluctuates",
      "Hissing or audible cavitation near pump or lines"
    ],
    "likely_causes": [
      "Pump failure or cavitation",
      "Air in suction line",
      "Clogged filter or strainer",
      "Valve partially closed or stuck",
      "Leak in supply plumbing"
    ],
    "diagnostics": [
      "Check the pressure gauge at the pump and at the Megajet inlet.",
      "Inspect suction lines for air leaks or kinks.",
      "Check pump for unusual vibration or noise (cavitation).",
      "Inspect inline filters/strain filters for debris and clean as required."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "If pressure is dangerously low, stop production to prevent product waste and inform supervisor.",
        "rationale": "Low pressure can damage cutter and produce out-of-spec products."
      },
      {
        "step": 2,
        "priority": "high",
        "action": "Check and replace/clean any suction or inline filters and strainers.",
        "rationale": "Blocked filters are a common root cause."
      },
      {
        "step": 3,
        "priority": "medium",
        "action": "Inspect suction line for air leaks; reseal clamps and fittings; ensure the inlet is fully submerged and free of debris.",
        "rationale": "Air in the line causes cavitation and pressure drop."
      },
      {
        "step": 4,
        "priority": "medium",
        "action": "If pump exhibits cavitation or mechanical failure, switch to backup pump if available and notify maintenance.",
        "rationale": "Pump replacement or repair may be required."
      }
    ],
    "tools_and_parts": [
      "Inline filter spare elements",
      "Clamps and hose repair kits",
      "Spare pump (if available)"
    ],
    "severity": "major",
    "operator_action": "Log event, stop the lane if product is out-of-spec, apply steps above, and notify admin if unresolved.",
    "admin_escalation": "Open maintenance request; if repeated, schedule full pump service."
  },
  {
    "id": "issue-blown-cutter-hose",
    "type": "troubleshooting",
    "title": "Blown Cutter Hose / Hose Failure",
    "affected_system": "Megajet - cutter supply hose",
    "symptoms": [
      "Rapid drop in pressure",
      "Water spraying at hose connection",
      "Immediate loss of cut functionality",
      "Loud hissing or visible burst"
    ],
    "likely_causes": [
      "Hose abrasion or wear",
      "Overpressure event",
      "Loose or failed clamp/connector",
      "Aging hose material"
    ],
    "diagnostics": [
      "Visually inspect hose along its length for rubbing points or abrasions.",
      "Check connectors for damage or silvering (stretching).",
      "Confirm proper routing and strain relief to prevent chafing."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Immediately stop water supply and power to the affected unit, apply LOTO if necessary.",
        "rationale": "Prevent injury and equipment damage."
      },
      {
        "step": 2,
        "priority": "high",
        "action": "Contain water spill and follow facility spill control procedures.",
        "rationale": "Safety & food-safety protocol."
      },
      {
        "step": 3,
        "priority": "medium",
        "action": "Replace the damaged hose with a verified spare; ensure connectors and clamps are tight and rated for pressure.",
        "rationale": "Restore safe operation quickly."
      },
      {
        "step": 4,
        "priority": "low",
        "action": "Check for root cause (overpressure, abrasion) and re-route or add protection against rubbing.",
        "rationale": "Prevent recurrence."
      }
    ],
    "tools_and_parts": [
      "Replacement high-pressure hose",
      "Appropriate rated clamps",
      "Spare O-rings/seals"
    ],
    "severity": "critical",
    "operator_action": "Follow steps 1–3 and call maintenance. Record in logs with photos.",
    "admin_escalation": "Immediate maintenance response required; inspect neighboring lines for similar wear."
  },
  {
    "id": "issue-bad-cutter-drive",
    "type": "troubleshooting",
    "title": "Bad Cutter Drive / Cutter Motor Failure",
    "affected_system": "Megajet - cutter drive",
    "symptoms": [
      "Cutter not spinning or intermittent spinning",
      "Unusual noises from cutter drive",
      "Cutter error codes on HMI"
    ],
    "likely_causes": [
      "Motor failure or worn brushes",
      "Belt or drive coupling failure",
      "Controller or VFD fault",
      "Insufficient lubrication"
    ],
    "diagnostics": [
      "Listen for unusual bearings or motor noises.",
      "Check drive belts or couplings for wear or looseness.",
      "Review drive controller alarm history.",
      "Attempt to jog motor from HMI in manual mode (observe safety protocols)."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Stop the lane and remove power to the drive if necessary. Tag for maintenance if mechanical.",
        "rationale": "Prevent further damage."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "Inspect belts, couplings, and motor brushes (if applicable); replace worn parts.",
        "rationale": "Common cause is mechanical wear."
      },
      {
        "step": 3,
        "priority": "low",
        "action": "If controller or VFD shows fault, capture fault code and escalate to electrical maintenance or vendor support.",
        "rationale": "Electrical faults require specialist attention."
      }
    ],
    "tools_and_parts": ["Spare belts", "Motor brushes", "VFD spare or replacement plan"],
    "severity": "major",
    "operator_action": "Isolate lane, contact maintenance, use alternate lane if available.",
    "admin_escalation": "Schedule replacement; inspect similar drives on other machines."
  },
  {
    "id": "issue-leaking-intensifier",
    "type": "troubleshooting",
    "title": "Leaking Intensifier",
    "affected_system": "Megajet - intensifier/pump",
    "symptoms": [
      "Oil or hydraulic fluid visible at intensifier",
      "Decrease in system pressure",
      "Unusual noises or pulsation"
    ],
    "likely_causes": [
      "Seal failure in intensifier",
      "Overpressure or relief valve fault",
      "Loose fittings"
    ],
    "diagnostics": [
      "Visually inspect intensifier exterior for leaks and check fluid levels.",
      "Listen for unusual pump sounds.",
      "Check relief valve and pressure sensors."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Stop production on affected unit, lock out power and lock out hydraulic sources if needed.",
        "rationale": "Prevent safety hazard and equipment damage."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "Contain spill and follow facility environmental procedures; replace intensifier seals or replace intensifier assembly.",
        "rationale": "Repair requires maintenance expertise."
      }
    ],
    "tools_and_parts": ["Seal kit for intensifier", "Absorbent materials for spill containment"],
    "severity": "critical",
    "operator_action": "Notify maintenance immediately and log incident.",
    "admin_escalation": "Replace intensifier as soon as possible; review maintenance records for preventative replacement schedule."
  },
  {
    "id": "issue-bad-vwheels",
    "type": "troubleshooting",
    "title": "Bad V-Wheels / Guide Wheels Issues",
    "affected_system": "Megajet - carriage guide wheels",
    "symptoms": [
      "Binding or rough motion of carriage",
      "Inaccurate cuts or chatter",
      "Excessive vibration"
    ],
    "likely_causes": ["Worn v-wheels", "Debris in rail", "Incorrect preload"],
    "diagnostics": [
      "Visually inspect v-wheels and rails for wear or debris.",
      "Manually move carriage and feel for smoothness.",
      "Check alignment and preload settings as per service manual."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Stop machine if binding is severe; clear debris and confirm lubrication is correct.",
        "rationale": "Prevent further mechanical damage."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "Replace worn v-wheels using OEM parts and verify alignment.",
        "rationale": "Worn wheels cause accuracy loss."
      }
    ],
    "tools_and_parts": ["Spare v-wheels (OEM)", "Lubricant", "Alignment tools"],
    "severity": "medium",
    "operator_action": "Clean rails and notify maintenance if replacement required.",
    "admin_escalation": "Schedule replacement during maintenance window."
  },
  {
    "id": "issue-failing-cutter-arms",
    "type": "troubleshooting",
    "title": "Failing Cutter Arms",
    "affected_system": "Megajet - cutter arms",
    "symptoms": [
      "Arm not holding correct position",
      "Loose or oscillating arm",
      "Arm motor error codes"
    ],
    "likely_causes": ["Bearing failure", "Actuator wear", "Fastener loosening"],
    "diagnostics": [
      "Visually inspect cutter arm bearings and mount points.",
      "Check fasteners for tightness.",
      "Review recent maintenance logs for wear history."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Remove power to the arm and tag out if mechanical replacement required.",
        "rationale": "Safety."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "Replace worn bearings or arm components; verify geometry after replacement.",
        "rationale": "Restores precise motion."
      }
    ],
    "tools_and_parts": ["Bearing kit", "Torque wrench", "Spare arm components"],
    "severity": "major",
    "operator_action": "Stop lane and notify maintenance.",
    "admin_escalation": "Order parts and schedule replacement."
  },
  {
    "id": "issue-bad-cutter-jet",
    "type": "troubleshooting",
    "title": "Bad Cutter Jet / Nozzle Issue",
    "affected_system": "Megajet - cutter jet/nozzle",
    "symptoms": [
      "Poor cut finish",
      "Spray pattern irregular",
      "Pressure drop localized at nozzle"
    ],
    "likely_causes": ["Nozzle wear", "Nozzle contamination", "Incorrect nozzle installed"],
    "diagnostics": [
      "Inspect nozzle orifice for wear or blockage with magnifier.",
      "Compare output to known-good nozzle pattern.",
      "Check part number of nozzle installed."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "medium",
        "action": "Replace nozzle with a verified spare (match OEM spec).",
        "rationale": "Nozzles wear and affect cut quality."
      },
      {
        "step": 2,
        "priority": "low",
        "action": "If frequent wear is observed, verify water filtration and condition to reduce abrasive contamination."
      }
    ],
    "tools_and_parts": ["Spare nozzles", "Magnifier", "Cleaning kit"],
    "severity": "medium",
    "operator_action": "Replace nozzle and run a sample cut.",
    "admin_escalation": "Inventory more spares if nozzle failure rate is high."
  },
  {
    "id": "issue-blurry-photolens",
    "type": "troubleshooting",
    "title": "Blurry or Spotted Photolens / Vision Issues",
    "affected_system": "Megajet - vision/photolens",
    "symptoms": [
      "Vision-based edge detection errors",
      "Spots or smears on camera image",
      "Inconsistent alignment of cuts due to vision errors"
    ],
    "likely_causes": ["Dirt or condensation on lens", "Damaged optical filter", "Lighting variation"],
    "diagnostics": [
      "Visually inspect lens and clean with approved lens wipe.",
      "Check lighting and reflectors for damage or position shifts.",
      "Run camera diagnostics if available."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Clean lens with approved lens cleaning solution and lint-free wipe. Do not touch lens with fingers.",
        "rationale": "Quick fix for many vision issues."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "If cleaning does not fix, replace protective filter or check sensor alignment.",
        "rationale": "Damaged optics need replacement."
      }
    ],
    "tools_and_parts": ["Lens cleaning kit", "Replacement protective filters"],
    "severity": "medium",
    "operator_action": "Clean lens and retest. If persists, escalate to admin/maintenance.",
    "admin_escalation": "Replace optics or schedule vendor support if hardware issue."
  },
  {
    "id": "issue-grasselli-miscut",
    "type": "troubleshooting",
    "title": "Grasselli Mis-cuts / Frequent Clogging",
    "affected_system": "Grasselli pre-cut system",
    "symptoms": [
      "Irregular pre-cut shapes",
      "Increased jamming or clogging at blade",
      "Frequent blade breakage"
    ],
    "likely_causes": [
      "Dull blade or wrong blade type",
      "Material fed at incorrect thickness",
      "Blade guard or holder misalignment",
      "Feed belt slip or hold-down issues"
    ],
    "diagnostics": [
      "Inspect blade for sharpness and correct type.",
      "Verify feed thickness sensor and adjust feed to match program thickness.",
      "Check hold-down belt tension and drive belt conditions."
    ],
    "critical_recovery_steps": [
      {
        "step": 1,
        "priority": "high",
        "action": "Stop feed and clear any jammed pieces to prevent blade damage.",
        "rationale": "Prevent further damage and stalling of production."
      },
      {
        "step": 2,
        "priority": "medium",
        "action": "Replace blade if dull or damaged; verify correct blade model for product.",
        "rationale": "Restores cut consistency."
      },
      {
        "step": 3,
        "priority": "medium",
        "action": "Check belt tensions and alignment; replace or retension if slip is detected.",
        "rationale": "Feed issues cause miscuts."
      }
    ],
    "tools_and_parts": ["Spare blades", "Belt set", "Blade alignment jig"],
    "severity": "major",
    "operator_action": "Clear jams, replace blade if necessary, and notify admin.",
    "admin_escalation": "Audit blade inventory and schedule staff training if miscuts repeat."
  },
  {
    "id": "issue-grasselli-belt-stop",
    "type": "troubleshooting",
    "title": "Grasselli Belt(s) Stop Spinning / Slipping",
    "affected_system": "Grasselli - belts & drives",
    "symptoms": ["One or more belts not moving", "Slipping under load", "No feed movement"],
    "likely_causes": ["Motor failure", "Clutch or coupling slip", "Belt tension incorrect", "Drive pulley wear"],
    "diagnostics": [
      "Observe motor/drive while running to see slipping or stalling.",
      "Check belt tension and wear, look for debris or foreign objects.",
      "Check the motor starter or drive alarm history."
    ],
    "critical_recovery_steps": [
      {"step":1,"priority":"high","action":"Stop the machine and clear blockages.","rationale":"Prevent belt damage."},
      {"step":2,"priority":"medium","action":"Retension or replace belts; verify pulleys and tensioners.","rationale":"Restore correct transfer."},
      {"step":3,"priority":"low","action":"If electrical motor problem suspected, escalate to maintenance for VFD or motor checks.","rationale":"Electrical repair required."}
    ],
    "tools_and_parts":["Spare belts","Tension gauge","Replacement pulleys"],
    "severity":"major",
    "operator_action":"Clear and replace belts if routine; contact maintenance for motor/VFD issues.",
    "admin_escalation":"Investigate root cause and perform preventive maintenance."
  },
  {
    "id": "procedure-startup-shutdown",
    "type": "procedure",
    "title": "Standard Startup & Shutdown Procedure (Megajet)",
    "category":"procedure",
    "steps": {
      "startup": [
        "Confirm area is clear of personnel and obstructions.",
        "Power on main control and wait for HMI boot.",
        "Check water supply valves are open and filters are clean.",
        "Start the water pump and verify pressure is stable and within spec.",
        "Run system self-test (HMI diagnostics) and confirm no active fault codes.",
        "Load program (e.g., 'McCrispy Fillet') and verify Megajet and Grasselli settings match the program.",
        "Run a dry test (no product) movement to confirm axes and actuators respond.",
        "Perform a sample cut and measure weight/thickness; adjust density setting if needed.",
        "Record startup check in logbook."
      ],
      "shutdown": [
        "Complete current batch and stop feed.",
        "Power down cutting heads per procedure.",
        "Shut off water pump and isolate water supply. Drain lines if required by SOP.",
        "Run any scheduled automatic clean cycles.",
        "Power down HMI and lock out main power if required for maintenance.",
        "Record shutdown time and any issues encountered."
      ]
    },
    "operator_notes":"Follow facility SOP for lockout/tagout when performing maintenance."
  },
  {
    "id": "procedure-calibration",
    "type": "procedure",
    "title": "Calibration & Target Weight Verification",
    "steps": [
      "Ensure Megajet pre-warm and pumps at nominal pressure.",
      "Select the program to calibrate (e.g., 'BWW Strips').",
      "Run a sample set of 10 pieces, weigh each, and average the result.",
      "Compare actual average weight to program target weight.",
      "If out of spec, use the Density Calculator to find the new density setting and enter it in the HMI.",
      "Re-run sample cut and confirm within tolerance.",
      "Log calibration change with operator initials and stamp."
    ],
    "notes":"Calibration must be performed at start of shift and any time product or material changes."
  },
  {
    "id": "procedure-maintenance-daily",
    "type": "procedure",
    "title": "Daily Maintenance Checklist",
    "checks": [
      "Check water and hydraulic oil levels.",
      "Inspect hoses and connectors for leaks.",
      "Check filters and strainers; clean if necessary.",
      "Verify belts and tensioners visually.",
      "Check nozzles and optics for cleanliness.",
      "Verify all safety guards are in place.",
      "Check emergency stop functionality.",
      "Document any abnormalities."
    ],
    "frequency":"daily",
    "responsible":"operator"
  },
  {
    "id": "procedure-maintenance-weekly",
    "type": "procedure",
    "title": "Weekly Maintenance Checklist",
    "checks": [
      "Inspect actuator mounting bolts and tighten to torque spec.",
      "Lubricate guide rails per manufacturer schedule.",
      "Inspect motor bearings for wear or unusual noise.",
      "Check camera calibration and lighting alignment.",
      "Test backup pump functionality (if applicable)."
    ],
    "frequency":"weekly",
    "responsible":"maintenance"
  },
  {
    "id": "procedure-safety",
    "type": "procedure",
    "title": "Safety & Emergency Procedures",
    "contents": [
      "Always lock out and tag out before performing mechanical work.",
      "Wear PPE: goggles, cut-resistant gloves, hearing protection, steel-toe boots.",
      "If an intensifier or high-pressure leak occurs, evacuate the area and notify supervisor; follow spill containment procedures.",
      "For electrical hazards, do not touch energized equipment; notify electrician.",
      "Document all incidents in incident log and report to safety lead."
    ]
  },
  {
    "id": "training-1",
    "type": "training",
    "title": "Operator Basic Training - Start & Stop",
    "chapters": [
      {
        "name":"Startup Overview",
        "content":"Steps to begin operation safely including pump checks, filter checks, and program selection."
      },
      {
        "name":"Shutdown Overview",
        "content":"Steps to safely power down equipment and prepare for cleaning/maintenance."
      }
    ],
    "quiz_example": {
      "questions": [
        {"q":"What is the first item to check before starting a Megajet?","a":"Area clear & safety guards"},
        {"q":"How often should you check filters?","a":"Daily"}
      ]
    }
  },
  {
    "id": "scenario-example-1",
    "type": "scenario",
    "title": "Actuator A12 fault scenario (training)",
    "megajet": 2,
    "symptom": "Actuator error code A12, carriage not moving, weight variance reported",
    "steps_to_run": [
      "Operator follows actuator troubleshooting steps in the knowledgebase.",
      "Operator documents the actions taken and records time to resolution.",
      "Operator notifies admin and logs the event in the scenario scoreboard."
    ],
    "scoring_guidelines": {
      "timely_action": 30,
      "correct_diagnostics": 50,
      "proper_logging": 20
    }
  },
  {
    "id": "kb-search-tips",
    "type": "notes",
    "title": "How to use this knowledgebase effectively",
    "contents": [
      "Search by symptom keywords (e.g., 'actuator', 'pressure', 'blade').",
      "When in doubt, follow Critical Recovery Steps in order of priority.",
      "Always log the event with photos when possible — it helps training and AI tuning.",
      "Admins may edit entries to improve accuracy."
    ]
  },
  {
    "id": "kb-maintenance-parts",
    "type": "parts",
    "title": "Recommended Spare Parts & Inventory",
    "parts": [
      {"part":"High-pressure cutter hose","qty_recommended":4},
      {"part":"Nozzles (assorted sizes)","qty_recommended":20},
      {"part":"V-wheels (OEM)","qty_recommended":12},
      {"part":"Intensifier seal kit","qty_recommended":2},
      {"part":"Blade sets for Grasselli","qty_recommended":50},
      {"part":"Belts for Grasselli","qty_recommended":10}
    ],
    "notes":"Maintain inventory list and reorder threshold in admin tools."
  },
  {
    "id": "kb-logging-format",
    "type": "template",
    "title": "Troubleshooting Log Template",
    "template": {
      "timestamp":"ISO timestamp",
      "user":"operator username",
      "megajet":"number (1-6)",
      "symptom":"short text",
      "photos":"base64 or file reference",
      "diagnosis":"AI suggested full response",
      "actions_taken":"list of steps executed",
      "outcome":"resolved/assisted/escalated",
      "time_to_resolution_minutes":"integer"
    }
  },
  {
    "id": "kb-escalation-policy",
    "type": "policy",
    "title": "Escalation Policy (Admins & Maintenance)",
    "policy": [
      "If an issue is not resolved within 30 minutes and production is impacted, notify maintenance lead immediately.",
      "Critical failures (hose bursts, intensifier leaks, major pump failure) require immediate production halt and management notification.",
      "Document all steps and preserve photos for vendor support if needed."
    ]
  },
  {
    "id": "kb-faq",
    "type": "faq",
    "title": "Quick FAQ",
    "q_and_a": [
      {"q":"My McCrispy Fillets are underweight, what do I do first?","a":"Check the HMI to ensure the 'McCrispy Fillet' program is loaded. Verify product thickness is within spec. Use the Density Calculator to get a new HMI density setting if needed, then run a sample cut."},
      {"q":"Can an operator change program targets?","a":"Only admins can change base program targets. Operators can and should adjust the HMI density setting as needed to maintain target weight."},
      {"q":"What to do if Grasselli blade breaks mid-shift?","a":"Stop the feed, clear debris, replace blade following safety procedures, log the event."}
    ]
  },
  {
    "id": "kb-contact",
    "type": "contact",
    "title": "Who to contact",
    "contacts": [
      {"role":"Maintenance Lead","name":"(fill in locally)","phone":"(fill in)"},
      {"role":"Operations Manager","name":"(fill in locally)","phone":"(fill in)"},
      {"role":"Safety Lead","name":"(fill in locally)","phone":"(fill in)"}
    ],
    "notes":"Populate with local contacts so operators can escalate quickly."
  }
];

export const PECOFOODS_KNOWLEDGE_BASE_STRING = JSON.stringify(PECOFOODS_KNOWLEDGE_BASE, null, 2);