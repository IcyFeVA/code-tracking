const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Initialize Supabase client

const supabaseUrl = "https://mmarjzhissgpyfwxudqd.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYXJqemhpc3NncHlmd3h1ZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0Mzg2MTUsImV4cCI6MjAzMzAxNDYxNX0.9GLFl6ZosXtNoL61uFx3L1nUc5ENRSWRnhS-LTDb6SA"

const supabase = createClient(supabaseUrl, supabaseKey);

const genders = [1, 2, 3, 4, 5, 6];
const pronouns = [1, 2, 3, 4, 5];
const relationshipTypes = [1, 2, 3];
const gender_preferences = [1, 2, 3];
const interests = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];

async function createFakeUser() {
    const gender = faker.helpers.arrayElement(genders);
    const user = {
        id: faker.string.uuid(),
        name: faker.internet.displayName(),
        age: faker.number.int({ min: 18, max: 80 }),
        gender: gender,
        pronouns: faker.helpers.arrayElements(pronouns, { min: 1, max: 2 }),
        looking_for: faker.helpers.arrayElement(relationshipTypes),
        gender_preference: faker.helpers.arrayElement(gender_preferences),
        interests: faker.helpers.arrayElements(interests, { min: 3, max: 8 }),
        avatar_url: faker.image.url(),
        last_active: faker.date.recent(),
    };

    const { data, error } = await supabase
        .from('profiles_test')
        .insert(user);

    if (error) {
        console.error('Error inserting user:', error);
    } else {
        console.log('User created:', user.name);
    }
}

async function createFakeUsers(count) {
    for (let i = 0; i < count; i++) {
        await createFakeUser();
    }
    console.log(`${count} fake users created.`);
}

// Create 100 fake users
createFakeUsers(400).then(() => process.exit());