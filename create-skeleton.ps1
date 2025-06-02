# 3.1 Make the top-level src folder and its subfolders
mkdir .\src\assets            # for images, logos, static files
mkdir .\src\components       # for reusable React components
mkdir .\src\pages            # for each page/screen
mkdir .\src\hooks            # for custom hooks (e.g. barcode scanner)
mkdir .\src\types            # for TypeScript type definitions
mkdir .\src\utils            # for helper functions (e.g. API wrappers)

# 3.2 Create the front-end “entry” files
New-Item -ItemType File .\src\App.tsx
New-Item -ItemType File .\src\index.tsx
New-Item -ItemType File .\src\router.tsx
New-Item -ItemType File .\src\styles.css

# 3.3 Create empty files under components/
New-Item -ItemType File .\src\components\Header.tsx
New-Item -ItemType File .\src\components\Sidebar.tsx
New-Item -ItemType File .\src\components\ProductTable.tsx
New-Item -ItemType File .\src\components\ProductForm.tsx
New-Item -ItemType File .\src\components\Toast.tsx

# 3.4 Create empty files under pages/
New-Item -ItemType File .\src\pages\Login.tsx
New-Item -ItemType File .\src\pages\Dashboard.tsx
New-Item -ItemType File .\src\pages\Inventory.tsx
New-Item -ItemType File .\src\pages\Staff.tsx
New-Item -ItemType File .\src\pages\Reports.tsx
New-Item -ItemType File .\src\pages\Settings.tsx

# 3.5 Create empty files under hooks/, types/, and utils/
New-Item -ItemType File .\src\hooks\useBarcodeScanner.ts
New-Item -ItemType File .\src\types\index.d.ts
New-Item -ItemType File .\src\utils\api.ts

# 4.1 Make the src-tauri folder and subfolders
mkdir .\src-tauri
mkdir .\src-tauri\src
mkdir .\src-tauri\src\commands
mkdir .\src-tauri\src\db
mkdir .\src-tauri\src\db\migration
mkdir .\src-tauri\src\models

# 4.2 Create the top‐level Rust & Tauri files
New-Item -ItemType File .\src-tauri\Cargo.toml
New-Item -ItemType File .\src-tauri\tauri.conf.json
New-Item -ItemType File .\src-tauri\src\main.rs

# 4.3 Create the command stubs under commands/
New-Item -ItemType File .\src-tauri\src\commands\mod.rs
New-Item -ItemType File .\src-tauri\src\commands\product.rs
New-Item -ItemType File .\src-tauri\src\commands\staff.rs
New-Item -ItemType File .\src-tauri\src\commands\transaction.rs
New-Item -ItemType File .\src-tauri\src\commands\import_export.rs

# 4.4 Create the database layer stubs under db/
New-Item -ItemType File .\src-tauri\src\db\mod.rs
New-Item -ItemType File .\src-tauri\src\db\schema.rs
New-Item -ItemType File .\src-tauri\src\db\connection.rs

# 4.5 Create the Rust model stubs under models/
New-Item -ItemType File .\src-tauri\src\models\product.rs
New-Item -ItemType File .\src-tauri\src\models\staff.rs
New-Item -ItemType File .\src-tauri\src\models\transaction.rs