CREATE TABLE IF NOT EXISTS members (
 id SERIAL PRIMARY KEY,
 name VARCHAR(30) NOT NULL UNIQUE,
 sober_days INTEGER NOT NULL DEFAULT 0,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO members (name) VALUES
 ('Jesk'),('Data'),('Voss'),('Tone'),('Cletey'),('Buster')
ON CONFLICT (name) DO NOTHING;
