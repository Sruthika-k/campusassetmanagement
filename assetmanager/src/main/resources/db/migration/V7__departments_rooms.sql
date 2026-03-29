-- V7: Add department and room tables with UUID PKs, and link them to asset table
-- NOTE: Flyway is currently disabled (spring.flyway.enabled=false).
-- These DDL statements are provided for reference and future migration use.
-- Hibernate DDL (spring.jpa.hibernate.ddl-auto=update) manages the schema at runtime.

CREATE TABLE department (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE room (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    department_id VARCHAR(36),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

ALTER TABLE asset ADD COLUMN department_id VARCHAR(36);
ALTER TABLE asset ADD COLUMN room_id VARCHAR(36);
