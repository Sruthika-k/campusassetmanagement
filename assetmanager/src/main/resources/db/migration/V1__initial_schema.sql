-- MySQL-compatible bootstrap for `asset` (matches JPA entity table name `asset`).
-- Additional tables are created in later migrations or by Hibernate ddl-auto where applicable.

CREATE TABLE IF NOT EXISTS asset (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    serial_no VARCHAR(255),
    status VARCHAR(50),
    asset_condition VARCHAR(50),
    qr_code_path TEXT,
    created_at DATETIME(6),
    deleted_at DATETIME(6),
    borrowable TINYINT(1) DEFAULT 1,
    version BIGINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
