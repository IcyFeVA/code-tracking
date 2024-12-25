CREATE TABLE profile_details (
  id UUID PRIMARY KEY REFERENCES profiles_test(id),
  bio TEXT,
  height_cm INTEGER,
  body_type SMALLINT,
  exercise_frequency SMALLINT,
  smoking_status SMALLINT,
  drinking_status SMALLINT,
  cannabis_use SMALLINT,
  diet_preference SMALLINT,
  education_level SMALLINT,
  occupation TEXT,
  relationship_status SMALLINT,
  relationship_type SMALLINT, -- e.g., monogamous, non-monogamous, polyamorous
  children SMALLINT, -- e.g., have and want more, have and don't want more, don't have and want, don't have and don't want
  pets SMALLINT[], -- array of pets owned
  languages SMALLINT[], -- array of languages spoken
  religion SMALLINT,
  political_views SMALLINT,
  zodiac_sign SMALLINT,
  personality_type SMALLINT, -- e.g., MBTI, Enneagram, etc.
  love_language SMALLINT[], -- array of love languages
  communication_style SMALLINT,
  conflict_resolution_style SMALLINT,
  living_situation SMALLINT, -- e.g., own, rent, with roommates, with family
  hometown TEXT,
  willing_to_relocate BOOLEAN,
  travel_frequency SMALLINT,
  hobbies TEXT[], -- array of hobbies not covered by the main interests
  favorite_music_genres TEXT[],
  favorite_movies_tv TEXT[],
  favorite_books TEXT[],
  social_media_activity SMALLINT,
  ideal_first_date TEXT,
  deal_breakers TEXT[],
  love_story TEXT, -- a field for users to describe their ideal love story or relationship
  values TEXT[], -- array of personal values
  kink_friendly BOOLEAN,
  openness_to_experimentation TEXT,
  intimacy_preferences TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- First, create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now, create the trigger that uses this function
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON profile_details
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();