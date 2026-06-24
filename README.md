Overview
VermIoT is a multi-sensor IoT data collection and monitoring system designed specifically for vermiculture beds. The project addresses the fundamental bottleneck of manual harvest readiness inspection, which causes product quality inconsistency and restricts scaling for vermiculture operations. The system gathers environmental data from each bed in real time, transmits it to a cloud backend, and surfaces actionable insights through a user-friendly web dashboard.
System Architecture & Technology StackFirmware: 
Arduino IDE/C++ is used for native ESP32 support and sensor polling.  
Protocol: The system utilizes MQTT via a HiveMQ broker, providing a lightweight and reliable protocol for constrained IoT devices.  
Backend Database: Firebase Realtime Database is employed for real-time synchronization and easy dashboard integration.  
Web Dashboard: The interface is built with React.js and Chart.js to provide interactive charts and live updates.  
Alerts: Firebase Cloud Messaging handles push and email alerts when environmental thresholds are breached.  Hardware Components
Microcontroller: An ESP32 Development Board acts as the central hub to aggregate sensor data and transmit it via Wi-Fi.  
Soil Moisture: Capacitive Soil Moisture Sensors (v1.2) monitor the beds to maintain the optimal 70-85% moisture target range.  
Temperature: DS18B20 Waterproof Temperature Sensors measure the compost bed to ensure it stays within the 15-25°C range.  
pH Level: An Analog pH Probe with a BNC Module tracks compost pH to maintain optimal microbial activity.  Gas/Air Quality: An MQ-135 Gas Sensor detects ammonia and CO2 levels to provide early warnings of overfeeding or pH imbalance.  
Dashboard Features
Displays real-time sensor readings per bed alongside historical trend charts over time.  
Features a color-coded harvest readiness indicator based on specific threshold logic.  
Delivers immediate threshold breach alerts via browser notifications and email.  
Includes a bed management panel showing the name, date seeded, and estimated maturity date for each bed.  Allows users to export historical readings using CSV downloads for any given date range.  
Scope and Limitations
This phase of the project strictly focuses on data collection infrastructure and excludes AI or ML model training.  
Connectivity relies entirely on Wi-Fi, meaning long-range protocols like LoRa or cellular are not included in this iteration.  
The current architecture and prototype cover 1 to 2 beds rather than a scaled, multi-bed parallel deployment.  
Project Information
Institution: Strathmore University   Course: ICS 4111: Embedded Systems and IoT   Team: Group 4E   
