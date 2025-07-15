-- Add theater_id column to viewing_records table for theater relationship
ALTER TABLE viewing_records 
ADD COLUMN theater_id BIGINT REFERENCES theaters(id);

-- Add index for better query performance
CREATE INDEX idx_viewing_records_theater_id ON viewing_records(theater_id);