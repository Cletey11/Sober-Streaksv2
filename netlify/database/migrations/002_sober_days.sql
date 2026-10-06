CREATE TABLE IF NOT EXISTS sober_days (
 member_id INTEGER NOT NULL,
 sober_date DATE NOT NULL,
 status TEXT NOT NULL CHECK (status IN ('sober','drank')),
 PRIMARY KEY (member_id, sober_date)
);
CREATE INDEX IF NOT EXISTS idx_sober_days_date ON sober_days(sober_date);