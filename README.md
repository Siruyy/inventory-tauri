# Canteen Inventory Control System (CICS)

A comprehensive Inventory Management System built with Tauri, React, and SQLite for canteen and retail businesses.

## Features

- **User Authentication**: Secure login system with role-based access control
- **Inventory Management**: Track products, categories, stock levels, and suppliers
- **Order Processing**: Create and manage orders with real-time inventory updates
- **Sales Reporting**: Generate reports on daily, weekly, and monthly sales
- **Staff Management**: Manage staff accounts and access permissions
- **Dashboard**: Visual overview of key business metrics

## Installation

### Prerequisites

- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 100MB disk space

### Installation Steps

1. Download the latest installer from the [Releases](https://github.com/Siruyy/inventory-tauri/releases) page
2. Run the `CICS-Setup-Inno.exe` installer
3. Follow the installation wizard:
   - Choose your preferred installation directory
   - Select whether to create desktop and/or Start Menu shortcuts
   - Complete the installation
4. Launch the application from the created shortcuts or the installation directory

## Getting Started

1. Launch the application
2. Log in with the default administrator credentials:
   - Username: `admin`
   - Password: `admin`
3. Change the default password immediately for security
4. Begin setting up your inventory categories and products

## Development

### Prerequisites

- Node.js 16+ and npm (or yarn)
- Rust 1.60+ and Cargo
- Tauri development prerequisites (refer to the [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/inventory-tauri.git
   cd inventory-tauri
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run tauri dev
   ```

### Building for Production

1. Build the application:
   ```bash
   npm run tauri build
   ```

2. The compiled application will be available in the `src-tauri/target/release` directory

## Database Information

The application uses SQLite for data storage. The database is stored in the application's data directory:

- In development mode: `inventory.db` in the project root
- In production mode: `<installation_directory>\data\inventory.db`

## License

All rights reserved.

## Author

Neel Ulysses A. Roda

---

© 2025 | Canteen Inventory Control System
