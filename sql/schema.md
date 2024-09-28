## Database Schema

The Supabase database for this project contains the following tables:

### Table: countries

- id: bigint (not nullable)
- name: text (nullable)
- iso2: text (not nullable)
- iso3: text (nullable)
- local_name: text (nullable)
- continent: USER-DEFINED (nullable)

### Table: hobbies_interests

- id: bigint (not nullable)
- created_at: timestamp with time zone (not nullable)
- category: text (nullable)
- value: text (nullable)
- label: text (nullable)

### Table: matches
- id: uuid (not nullable)
- user1_id: uuid (nullable)
- user2_id: uuid (nullable)
- user1_action: smallint (nullable)
- user2_action: smallint (nullable)
- created_at: timestamp with time zone (nullable)
- matched_at: timestamp with time zone (nullable)
- matched: boolean (nullable)
- conversation_id: uuid (nullable)

### Table: hobbies_interests_user
- id: bigint (not nullable)
- created_at: timestamp with time zone (not nullable)
- value: text (nullable)
- user_id: uuid (nullable)

### Table: match_notifications
- id: uuid (not nullable)
- user_id: uuid (not nullable)
- matched_user_id: uuid (not nullable)
- created_at: timestamp with time zone (nullable)
- is_read: boolean (nullable)

### Table: profiles_test
- id: uuid (not nullable)
- updated_at: timestamp with time zone (nullable)
- username: text (nullable)
- avatar_url: text (nullable)
- name: text (nullable)
- age: smallint (nullable)
- pronouns: ARRAY (nullable)
- looking_for: smallint (nullable)
- interests: ARRAY (nullable)
- full_name: text (nullable)
- gender_preference: smallint (nullable)
- gender: smallint (nullable)
- last_active: date (nullable)
- push_token: jsonb (nullable)
- avatar_pixelated_url: text (nullable)

### Table: pending_match_notifications
- id: uuid (not nullable)
- user1_id: uuid (not nullable)
- user2_id: uuid (not nullable)
- created_at: timestamp with time zone (nullable)
- processed: boolean (nullable)

### Table: profile_details
- id: uuid (not nullable)
- bio: text (nullable)
- height_cm: integer (nullable)
- body_type: smallint (nullable)
- exercise_frequency: smallint (nullable)
- smoking_status: smallint (nullable)
- drinking_status: smallint (nullable)
- cannabis_use: smallint (nullable)
- diet_preference: smallint (nullable)
- education_level: smallint (nullable)
- occupation: text (nullable)
- relationship_status: smallint (nullable)
- relationship_type: smallint (nullable)
- children: smallint (nullable)
- pets: ARRAY (nullable)
- languages: ARRAY (nullable)
- religion: smallint (nullable)
- political_views: smallint (nullable)
- zodiac_sign: smallint (nullable)
- personality_type: smallint (nullable)
- love_language: ARRAY (nullable)
- communication_style: smallint (nullable)
- conflict_resolution_style: smallint (nullable)
- living_situation: smallint (nullable)
- hometown: text (nullable)
- willing_to_relocate: boolean (nullable)
- travel_frequency: smallint (nullable)
- hobbies: ARRAY (nullable)
- favorite_music_genres: ARRAY (nullable)
- favorite_movies_tv: ARRAY (nullable)
- favorite_books: ARRAY (nullable)
- social_media_activity: smallint (nullable)
- ideal_first_date: text (nullable)
- deal_breakers: ARRAY (nullable)
- love_story: text (nullable)
- values: ARRAY (nullable)
- kink_friendly: boolean (nullable)
- openness_to_experimentation: text (nullable)
- intimacy_preferences: ARRAY (nullable)
- created_at: timestamp with time zone (nullable)
- updated_at: timestamp with time zone (nullable)

### Table: conversations
- id: uuid (not nullable)
- created_at: timestamp with time zone (nullable)

### Table: conversation_participants
- conversation_id: uuid (not nullable)
- user_id: uuid (not nullable)

### Table: messages
- id: uuid (not nullable)
- conversation_id: uuid (nullable)
- sender_id: uuid (nullable)
- content: text (not nullable)
- created_at: timestamp with time zone (nullable)
- edited: boolean (nullable)
- read_by: ARRAY (nullable)
