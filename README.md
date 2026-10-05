# AETHER Mobile Application

> Cross-platform luxury electronics & hardware management app built with **React Native (0.86)** & **Expo (SDK 57)**.
> Matches 100% of the AETHER web architecture, hardware catalog, engineering tabs, floating cart, and admin inventory suite.

---

## ⚡ Key Features

* **Mobile App Layout**:
  * Native Bottom Navigation Dock: **Discover (⚡)**, **Hardware Catalog (📦)**, **Dispatch Cart (🛒)**, **Account / Clearance (👤)**, and **Admin Portal (🛡️)**.
  * Draggable Floating Cart button with active allocation counter.
  * Native App Header with live role clearance switcher (`CLIENT` ↔ `ADMIN`).
* **Deep Hardware Dossier**:
  * Hero imagery with hardware badges.
  * **Engineering Overview & Architecture Tab**: Narrative breakdown of acoustics, thermal dissipation, and silicon.
  * **Technical Specifications Matrix Tab**: Telemetry key-value pairs matching web specifications.
  * **Materials, Substrates & Craftsmanship Finish Tab**: Titanium, ceramic, sapphire, and Concierge Warranty coverage.
  * Add to Cart (auto-disables when item is already in cart) and Express Buy flows.
* **Concierge Checkout**:
  * Armored white-glove logistics or express air flight dispatch options.
  * Multi-method settlement (Apple Pay, Vault Key, Black Card).
  * Generated Order Reference ID with live tracking status.
* **Full Administrator Inventory Suite**:
  * Vault valuation & stock metrics.
  * Hardware Inventory Ledger with instant stock units and MSRP price adjustment.
  * **Register New Hardware Stock**:
    * Name, category selector, SKU generation, pricing, initial stock.
    * Imagery presets and URLs.
    * Narrative **Engineering Overview**.
    * **Materials & Finish** with Warranty Tier.
    * **Technical Specifications Matrix** with **Load Category Template** button, dynamic row addition, and removal.

---

## 🚀 Running the Mobile App

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Expo Dev Server
```bash
npm start
# or
npx expo start
```

### 3. Open on Devices
* **iOS Simulator**: Press `i` in the terminal (macOS with Xcode installed).
* **Android Emulator**: Press `a` in the terminal (Android Studio configured).
* **Physical iPhone / Android**: Download **Expo Go** from the App Store / Google Play and scan the terminal QR code.
* **Web Browser**: Press `w` to run in browser mode.
