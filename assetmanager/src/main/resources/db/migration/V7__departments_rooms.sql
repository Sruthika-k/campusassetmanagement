-- V7: Add department and room tables with UUID PKs, and link them to asset table

CREATE TABLE department (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE room (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    department_id VARCHAR(36),
    PRIMARY KEY (id),
    CONSTRAINT fk_room_department 
        FOREIGN KEY (department_id) REFERENCES department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE asset 
ADD COLUMN department_id VARCHAR(36),
ADD COLUMN room_id VARCHAR(36);

CREATE INDEX idx_asset_department 
    ON asset (department_id);

CREATE INDEX idx_asset_room 
    ON asset (room_id);
