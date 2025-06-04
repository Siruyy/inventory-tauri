# Inventory Management System (IMS) for St. Vincent’s College Canteen

## 1. Introduction

This project is an Inventory Management System (IMS) developed for the St. Vincent’s College Incorporated canteen[cite: 4272]. It aims to replace manual methods of recording transactions and tracking stock levels, which are traditionally time-consuming and prone to errors, inefficiencies, and service delays[cite: 4272, 4273]. As student and faculty populations increase, these manual shortcomings have led to inventory mismatches, inaccurate financial records, and sluggish transaction processing[cite: 4274]. This system automates key processes to ensure a more seamless, accurate, and real-time method for managing sales and inventory[cite: 4275, 4276].

## 2. Project Status

This project is currently under development.
* **Implemented Pages/Features**: Login, Dashboard, Staff Management (List, Profile, Add/Edit), Inventory (Product Listing, Add/Edit Product, Filtering).
* **Upcoming Pages/Features**: Orders (Point of Sale), Reports, Menu/Category Management, User Profile & Settings, Notifications.

## 3. Features

Based on the project scope and system design:
* **Sales Automation**: Efficiently record sales transactions and calculate totals[cite: 4304, 4288].
* **Inventory Monitoring**: Real-time tracking of stock levels, including stock-in and stock-out operations[cite: 4304, 4290].
* **Report Generation**: Automated generation of financial (daily, weekly, monthly) and inventory reports (stock status) for managerial decision-making[cite: 4288, 4304].
* **User Roles & Authentication**:
    * **Administrator**: System oversight, data management (including users), and report generation[cite: 4289, 4305].
    * **Cashier**: Handle sales transactions and real-time inventory input[cite: 4289, 4306].
* **Barcode Scanning Support**: Facilitates quick item input for sales and inventory management[cite: 4306].
* **Offline Capability**: Designed to operate effectively on a local network, without requiring continuous internet access[cite: 4306].

## 4. Tech Stack

* **Frontend**: React, TypeScript
* **Bundler/Dev Server**: Vite
* **Styling**: Tailwind CSS (as per project configuration)
* **Desktop Framework**: Tauri (using Rust for the backend)
* **Database**: MySQL [cite: 4322]
* **Version Control**: Git

## 5. Target Audience

The primary users of this system are the staff of St. Vincent’s College Canteen in Dipolog City. This includes:
* Canteen Managers: For enhanced oversight via real-time reporting and automated inventory control[cite: 4300].
* Cashiers and Administrative Staff: To reduce workload and minimize human error, improving operational efficiency[cite: 4301].
The system also aims to benefit students and faculty by providing quicker and more reliable service[cite: 4302].

## 6. Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js and npm (or yarn)
* Rust and Cargo
* Tauri development prerequisites (refer to the official [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites))

### Installation & Running

1.  **Clone the repository (if you haven't already)**:
    ```bash
    git clone <your-repository-url>
    cd inventory-tauri
    ```

2.  **Install frontend dependencies**:
    (This step installs packages like React, Tauri API, etc., listed in your `package.json`)
    ```bash
    npm install
    ```
    (or `yarn install`)

3.  **Run the Vite development server (frontend UI only)**:
    (Useful for focusing on UI changes with hot-reloading)
    ```bash
    npm run dev
    ```
    This will typically start the server on `http://localhost:1420` (as configured in `vite.config.ts` and referenced in `tauri.conf.json`).

4.  **Run the full Tauri application (frontend + Rust backend)**:
    (For development with all Tauri features and backend integration)
    ```bash
    npm run tauri dev
    ```

### Building the Application

To create a distributable version of your application:

1.  **Build the frontend assets**:
    (This compiles your TypeScript and React code, and bundles assets for production)
    ```bash
    npm run build
    ```

2.  **Build the Tauri application**:
    (This bundles the frontend with the Rust backend into an executable/installer for your target platform(s))
    ```bash
    npm run tauri build
    ```

## 7. Project Structure Overview

* `src/`: Contains the React frontend application (TypeScript/TSX files).
    * `components/`: Reusable UI components (e.g., Sidebar, Header, Drawers).
    * `pages/`: Top-level page components (e.g., Login, Dashboard, Staff, Inventory).
    * `router.tsx`: Defines application routing.
    * `main.tsx`: Main entry point for the React application.
    * `App.css`: Global styles.
* `src-tauri/`: Contains the Rust backend for the Tauri application.
    * `src/main.rs`: Main entry point for the Rust application.
    * `src/lib.rs`: Core Rust library logic, command definitions.
    * `src/commands/`: Likely location for specific backend command handlers (e.g., product, staff, transaction logic).
    * `src/db/`: Database connection and schema logic (e.g., `connection.rs`, `schema.rs`).
    * `tauri.conf.json`: Tauri application configuration file.
    * `Cargo.toml`: Rust project manifest, managing dependencies.
* `public/`: Static assets served by Vite.
* `index.html`: Main HTML entry point.
* `package.json`: Defines project scripts, frontend dependencies, and metadata.
* `vite.config.ts`: Vite configuration file.
* `tsconfig.json`: TypeScript configuration for the project.
* `Group 3.docx`: Detailed project documentation and research paper.
* `IMS Design.pdf`: Figma UI/UX design mockups.

## 8. Authors

This project was developed by:
Neel Ulysses A. Roda

(In partial fulfillment of the requirements in SOFTWARE ENGINEERING 101 at St. Vincent’s College Incorporated, June 06, 2025 [cite: 4270, 4271])

## 9. License

"All Rights Reserved."
