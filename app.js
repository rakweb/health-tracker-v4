/* =========================================================
   Health Tracker App – app.js
   Architecture-first, PWA-safe, migration-ready
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     APP BOOTSTRAP
     ========================================================= */
  const App = {
    async init() {
      try {
        DB.init();
        Accessibility.init();
        Updates.init();
        PWA.init();

        // Hook UI events last (after DOM + DB exist)
        UI.init();

        console.info("[App] Initialized successfully");
      } catch (err) {
        console.error("[App] Initialization failed", err);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", App.init);

  /* =========================================================
     STATE (in-memory only; persisted via DB)
     ========================================================= */
  const State = {
    entries: [],
    filters: {
      from: null,
      to: null
    }
  };

  /* =========================================================
     DATABASE – IndexedDB with migrations
     ========================================================= */
  const DB = {
    NAME: "healthDB",
    VERSION: 2,
    db: null,

    init() {
      const open = indexedDB.open(this.NAME, this.VERSION);

      open.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        console.info("[DB] Upgrade needed from", oldVersion);

        // v1 – base store
        if (oldVersion < 1) {
          db.createObjectStore("entries", { keyPath: "id" });
        }

        // v2 – indexes
        if (oldVersion < 2) {
          const store = event.target.transaction.objectStore("entries");
          store.createIndex("byDate", "date");
        }
      };

      open.onsuccess = () => {
        this.db = open.result;
        console.info("[DB] Ready (v" + this.VERSION + ")");
      };

      open.onerror = () => {
        console.error("[DB] Failed to open database");
      };
    },

    tx(storeName, mode = "readonly") {
      return this.db
        .transaction(storeName, mode)
        .objectStore(storeName);
    },

    async getAllEntries() {
      return new Promise((resolve, reject) => {
