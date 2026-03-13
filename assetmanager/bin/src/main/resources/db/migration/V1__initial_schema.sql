CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    department_id INT REFERENCES departments(id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50),
    department_id INT REFERENCES departments(id)
);

CREATE TABLE assets (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    serial_no VARCHAR(255),
    status VARCHAR(50),
    condition VARCHAR(50),
    room_id INT REFERENCES rooms(id),
    department_id INT REFERENCES departments(id),
    purchase_date DATE,
    warranty_expiry DATE,
    qr_code_path TEXT,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE asset_events (
    id SERIAL PRIMARY KEY,
    asset_id UUID,
    event_type VARCHAR(100),
    description TEXT,
    performed_by UUID,
    timestamp TIMESTAMP
);