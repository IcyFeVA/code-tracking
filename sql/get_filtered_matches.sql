CREATE OR REPLACE FUNCTION public.get_filtered_matches(
    user_id UUID, 
    limit_count INT,
    looking_for SMALLINT,
    body_type_filter SMALLINT DEFAULT NULL,
    zodiac_sign_filter SMALLINT DEFAULT NULL,
    smoking_status_filter SMALLINT DEFAULT NULL,
    drinking_status_filter SMALLINT DEFAULT NULL,
    interest_filter SMALLINT[] DEFAULT NULL
) 
RETURNS TABLE (
    id UUID,
    name TEXT,
    age SMALLINT,
    gender SMALLINT,
    avatar_url TEXT,
    interests SMALLINT[]
) AS $$
DECLARE
    matched_count INT;
BEGIN
    -- First, try to get new matches
    RETURN QUERY 
    SELECT 
        p.id AS id,
        p.name AS name,
        p.age AS age,
        p.gender AS gender,
        p.avatar_url AS avatar_url,
        p.interests AS interests
    FROM profiles_test p
    LEFT JOIN profile_details pd ON p.id = pd.id
    WHERE p.id != get_filtered_matches.user_id
    AND p.looking_for = get_filtered_matches.looking_for  -- Match exact looking_for value
    AND (body_type_filter IS NULL OR pd.body_type = body_type_filter)
    AND (zodiac_sign_filter IS NULL OR pd.zodiac_sign = zodiac_sign_filter)
    AND (smoking_status_filter IS NULL OR pd.smoking_status = smoking_status_filter)
    AND (drinking_status_filter IS NULL OR pd.drinking_status = drinking_status_filter)
    AND (interest_filter IS NULL OR p.interests && interest_filter)
    AND NOT EXISTS (
        SELECT 1 
        FROM matches m 
        WHERE (
            (m.user1_id = get_filtered_matches.user_id AND m.user2_id = p.id AND m.user1_action IS NOT NULL)
            OR 
            (m.user2_id = get_filtered_matches.user_id AND m.user1_id = p.id AND m.user2_action IS NULL)
        )
    )
    ORDER BY p.last_active DESC
    LIMIT get_filtered_matches.limit_count;

    -- Check if we found any matches
    GET DIAGNOSTICS matched_count = ROW_COUNT;

    -- If no matches found, include previously disliked profiles
    IF matched_count = 0 THEN
        RETURN QUERY 
        SELECT 
            p.id AS id,
            p.name AS name,
            p.age AS age,
            p.gender AS gender,
            p.avatar_url AS avatar_url,
            p.interests AS interests
        FROM profiles_test p
        LEFT JOIN profile_details pd ON p.id = pd.id
        WHERE p.id != get_filtered_matches.user_id
        AND p.looking_for = get_filtered_matches.looking_for  -- Match exact looking_for value
        AND (body_type_filter IS NULL OR pd.body_type = body_type_filter)
        AND (zodiac_sign_filter IS NULL OR pd.zodiac_sign = zodiac_sign_filter)
        AND (smoking_status_filter IS NULL OR pd.smoking_status = smoking_status_filter)
        AND (drinking_status_filter IS NULL OR pd.drinking_status = drinking_status_filter)
        AND (interest_filter IS NULL OR p.interests && interest_filter)
        AND EXISTS (
            SELECT 1 
            FROM matches m 
            WHERE (
                (m.user1_id = get_filtered_matches.user_id AND m.user2_id = p.id AND m.user1_action = 0)
                OR 
                (m.user2_id = get_filtered_matches.user_id AND m.user1_id = p.id AND m.user2_action = 0)
            )
        )
        ORDER BY p.last_active DESC
        LIMIT get_filtered_matches.limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;