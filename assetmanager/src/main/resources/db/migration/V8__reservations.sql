-- V8__reservations.sql
-- Add reservation table with proper foreign key constraints

CREATE TABLE reservation (
    id VARCHAR(36) NOT NULL,
    asset_id VARCHAR(36) NOT NULL,
    reserved_by VARCHAR(36) NOT NULL,
    start_time DATETIME(6) NOT NULL,
    end_time DATETIME(6) NOT NULL,
    status ENUM('ACTIVE','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_reservation_asset 
        FOREIGN KEY (asset_id) REFERENCES asset(id),
    CONSTRAINT fk_reservation_user 
        FOREIGN KEY (reserved_by) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reservation_asset_status 
    ON reservation (asset_id, status);

CREATE INDEX idx_reservation_user 
    ON reservation (reserved_by);
