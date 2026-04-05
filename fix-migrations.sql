-- Fix migration state - run this in your D1 database console
-- This marks all migrations as already applied without deleting any existing data

CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL UNIQUE,
    created_at INTEGER
);

-- Insert all migration hashes that don't already exist
-- Using INSERT OR IGNORE to skip duplicates without deleting existing data
INSERT OR IGNORE INTO __drizzle_migrations (hash, created_at) VALUES 
('0000_mighty_marten_broadcloak', 1775195666358),
('0001_brief_firebird', 1775303384381),
('0002_conscious_vampiro', 1775303546703),
('0003_loose_stick', 1775303634521),
('0004_short_adam_warlock', 1775304459117),
('0005_chubby_blindfold', 1775368452230),
('0006_lethal_dazzler', 1775368938540),
('0007_quiet_meggan', 1775369607605);
