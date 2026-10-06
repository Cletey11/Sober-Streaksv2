CREATE TABLE IF NOT EXISTS members (
 id INTEGER PRIMARY KEY,
 name TEXT NOT NULL UNIQUE,
 sober_days INTEGER NOT NULL DEFAULT 0,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO members (id,name) VALUES
 (1,'Jesk'),(2,'Data'),(3,'Voss'),(4,'Tone'),(5,'Cletey'),(6,'Buster')
ON CONFLICT (id) DO NOTHING;