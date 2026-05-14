import { TrainingCourse } from '../types';

export const initialTrainingCourses: TrainingCourse[] = [
    {
        id: 'megajet-101',
        title: 'Megajet HMI Mastery',
        level: 'Beginner',
        description: 'A complete guide to every screen and function on the Megajet HMI. This course will turn any operator into a confident user of the machine\'s interface.',
        modules: [
            {
                moduleTitle: 'Module 1: The Main Dashboard',
                topics: [
                    {
                        topicTitle: 'Understanding the Main Dashboard',
                        content: `The Main Dashboard is your primary overview of the machine's status. It's the first screen you'll see after startup and the one you'll reference most often during production.

**Key Areas:**
- **System Status:** A large indicator showing the machine's current state: \`Ready\`, \`Running\`, \`Faulted\`, or \`E-Stop\`.
- **Production Counters:** Displays real-time data like \`Total Cuts\`, \`Product Count\`, and \`Reject Rate\`.
- **Pressure & Flow Gauges:** Digital gauges showing the live water pressure (PSI) and garnet flow.
- **Active Program:** Shows the name of the currently loaded cutting program (e.g., 'McCrispy Fillet').

Familiarize yourself with the normal operating values on this screen so you can spot problems quickly.
[DIAGRAM: HMI Main Dashboard Layout with key areas highlighted]`
                    },
                ],
            },
            {
                moduleTitle: 'Module 2: Program Management',
                topics: [
                    {
                        topicTitle: 'The Program Selection Screen',
                        content: `This screen is where you tell the Megajet what you are cutting. Selecting the correct program is critical for achieving target weight and thickness.

**Key Areas:**
- **Program List:** A scrollable list of all available programs (e.g., \`McCrispy Fillet\`, \`BWW Boneless Wings\`).
- **Active Program:** Clearly displays the currently loaded program.
- **Load Button:** Press this after selecting a program from the list to make it active.
- **Target Parameters:** Shows the key targets for the selected program, like \`Target Weight\` and \`Target Thickness\`. These are read-only for operators.

**Procedure:**
1. At the start of a new product run, navigate to this screen.
2. Scroll to and tap the correct program name.
3. Verify the Target Parameters match the spec sheet for the run.
4. Press the \`Load\` button. The system will confirm the program is active.
[DIAGRAM: Program Selection Screen]`
                    },
                ],
            },
            {
                moduleTitle: 'Module 3: Manual Controls',
                topics: [
                    {
                        topicTitle: 'Using the Manual Control Screen',
                        content: `The Manual Control screen allows you to operate individual parts of the machine for testing and maintenance. **This screen should only be used when production is stopped.**

**Available Controls:**
- **Gantry Jog:** Buttons (X+, X-, Y+, Y-) to slowly move the cutting head assembly. Used for alignment checks.
- **Conveyor Control:** Buttons to run the conveyor belt forward or backward at a slow speed.
- **Water Jet Test Fire:** A button to activate the water jet without moving the gantry. Used to check the stream quality.
- **Actuator Test:** Buttons to extend or retract individual cutting actuators.

Always ensure the area is clear before using any manual controls.
[DIAGRAM: Manual Control Panel with buttons highlighted]`
                    },
                ],
            },
            {
                moduleTitle: 'Module 4: Alarms & Diagnostics',
                topics: [
                    {
                        topicTitle: 'The Active Alarms & Alarm History Screens',
                        content: `When a problem occurs, the HMI will display an alarm. Understanding these alarms is key to quick troubleshooting.

- **Active Alarms Screen:** This screen appears automatically when a fault occurs. It shows the error code (e.g., \`E-101\`) and a brief description. It usually has an 'Acknowledge' button to silence the alarm after the issue is resolved.
- **Alarm History Log:** This screen provides a list of all past alarms, with timestamps. It is incredibly useful for diagnosing recurring problems. If you see the same alarm multiple times in one shift, you can show this log to the maintenance team.

[DIAGRAM: Alarm History Screen showing a list of past alarms]`
                    },
                ]
            }
        ],
    },
    {
        id: 'megajet-201',
        title: 'Advanced Calibration & Optimization',
        level: 'Advanced',
        description: 'Go beyond basic operation. Learn to fine-tune the Megajet for maximum yield, perfect cut quality, and efficient troubleshooting using advanced tools.',
        modules: [
            {
                moduleTitle: 'Module 1: The Cutter Adjustment Tool',
                topics: [
                    {
                        topicTitle: 'What is the Cutter Adjustment Tool?',
                        content: `The Cutter Adjustment Tool is a precision feature on the HMI used to fine-tune the exact starting position of the water jet stream relative to the vision system's calculations. It allows you to make micro-adjustments to the X and Y offsets.

**Purpose:** You use this tool to compensate for minor mechanical shifts, such as after replacing a nozzle or performing maintenance on the cutting head. If you notice all cuts are consistently 2mm to the left of where they should be, this tool is the solution.`
                    },
                    {
                        topicTitle: 'Step-by-Step: Adjusting X/Y Offsets',
                        content: `**SAFETY:** This procedure should be done with production stopped and appropriate permissions.
1.  Navigate to the 'Maintenance' screen, then select 'Cutter Adjustment'.
2.  The screen will show the current X and Y offset values (e.g., X: +0.1mm, Y: -0.05mm).
3.  Place a test piece of material (like a calibration mat or a test piece of poultry) on the belt.
4.  Use the 'Test Fire' function to make a single cut at the current zero position.
5.  Measure the deviation of the cut from the intended target point.
6.  Enter the correction into the X and Y fields. For example, if the cut is 2mm to the left (negative X direction), you would enter \`+2.0\` in the X offset field to move it back to the right.
7.  Save the new offset and perform another test fire to confirm the adjustment is correct.

[DIAGRAM: Cutter Adjustment screen showing X/Y offset values and Save button]`
                    },
                ],
            },
            {
                moduleTitle: 'Module 2: Mastering the Density Setting',
                topics: [
                    {
                        topicTitle: 'Density vs. Weight: A Deep Dive',
                        content: `The 'Density' setting is the single most important calibration parameter for achieving accurate weights. It is **not** the physical density of the chicken. It is a software multiplier that tells the vision system how "heavy" a piece of poultry is for its perceived size.

- **Higher Density Setting:** Tells the machine the product is heavy for its size. This will cause the machine to make **smaller** cuts to hit the target weight.
- **Lower Density Setting:** Tells the machine the product is light for its size. This will cause the machine to make **larger** cuts.

You must adjust this setting throughout the day as product temperature and water content change.`
                    },
                    {
                        topicTitle: 'How and When to Calibrate Density',
                        content: `Use the **Density Calculator** tool in this app for the most accurate starting point. However, you will still need to fine-tune it.

**Procedure:**
1.  Load the correct program (e.g., \`BWW Boneless Wings\`).
2.  Run a sample of 5-10 pieces through the cutter.
3.  Carefully weigh each piece and calculate the average weight.
4.  Compare the average weight to the program's target weight.
5.  If the average is **under** the target, **decrease** the Density Setting in small increments (e.g., from 1.05 to 1.04).
6.  If the average is **over** the target, **increase** the Density Setting in small increments (e.g., from 1.05 to 1.06).
7.  Repeat the process until the average weight is consistently within the acceptable tolerance.
8.  Log the new density setting for your shift.`
                    },
                ],
            },
        ],
    },
];