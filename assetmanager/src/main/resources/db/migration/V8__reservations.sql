-- V8__reservations.sql
-- NOTE: Flyway is disabled (spring.flyway.enabled=false).
-- Hibernate ddl-auto=update creates this table automatically.
-- This script is provided for reference / future migration use.

CREATE TABLE IF NOT EXISTS reservation (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    asset_id    VARCHAR(36)  NOT NULL,
    reserved_by VARCHAR(36)  NOT NULL,
    start_time  DATETIME     NOT NULL,
    end_time    DATETIME     NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME,

    CONSTRAINT fk_reservation_asset
        FOREIGN KEY (asset_id) REFERENCES asset(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reservation_asset_status
    ON reservation (asset_id, status);
