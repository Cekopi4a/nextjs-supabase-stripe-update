import { createClient } from '@supabase/supabase-js';
import { ExerciseFromAPI, Exercise } from '../lib/types/exercises';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role key for admin access

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EXERCISES_JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGES_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

async function fetchExercisesData(): Promise<ExerciseFromAPI[]> {
  console.log('Fetching exercises from:', EXERCISES_JSON_URL);
  
  try {
    const response = await fetch(EXERCISES_JSON_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const exercises = await response.json();
    console.log(`Successfully fetched ${exercises.length} exercises`);
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
}

function transformExercise(exercise: ExerciseFromAPI): Omit<Exercise, 'created_at' | 'updated_at'> {
  // Transform image paths to full URLs
  const images = exercise.images.map(imagePath => `${IMAGES_BASE_URL}${imagePath}`);
  
  return {
    id: exercise.id,
    name: exercise.name,
    force: exercise.force,
    level: exercise.level,
    mechanic: exercise.mechanic,
    equipment: exercise.equipment,
    primary_muscles: exercise.primaryMuscles,
    secondary_muscles: exercise.secondaryMuscles,
    instructions: exercise.instructions,
    category: exercise.category as any, // Type assertion since API might have different categories
    images: images,
  };
}

async function clearExistingExercises(): Promise<void> {
  console.log('Clearing existing exercises...');
  
  const { error } = await supabase
    .from('exercises')
    .delete()
    .neq('id', ''); // Delete all records
  
  if (error) {
    console.error('Error clearing exercises:', error);
    throw error;
  }
  
  console.log('Existing exercises cleared successfully');
}

async function importExercises(exercises: ExerciseFromAPI[]): Promise<void> {
  console.log(`Starting import of ${exercises.length} exercises...`);
  
  // Transform exercises to match our database schema
  const transformedExercises = exercises.map(transformExercise);
  
  // Import in batches to avoid timeout
  const batchSize = 100;
  let importedCount = 0;
  
  for (let i = 0; i < transformedExercises.length; i += batchSize) {
    const batch = transformedExercises.slice(i, i + batchSize);
    
    console.log(`Importing batch ${Math.floor(i / batchSize) + 1} (${batch.length} exercises)...`);
    
    const { data, error } = await supabase
      .from('exercises')
      .insert(batch)
      .select('id');
    
    if (error) {
      console.error(`Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
      throw error;
    }
    
    importedCount += batch.length;
    console.log(`Successfully imported ${importedCount}/${transformedExercises.length} exercises`);
  }
  
  console.log(`✅ Import completed! ${importedCount} exercises imported successfully.`);
}

async function validateImport(): Promise<void> {
  console.log('Validating import...');
  
  const { count, error } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error validating import:', error);
    throw error;
  }
  
  console.log(`✅ Validation complete: ${count} exercises found in database`);
  
  // Get a sample of exercises to verify data integrity
  const { data: sampleExercises, error: sampleError } = await supabase
    .from('exercises')
    .select('id, name, category, level, primary_muscles, images')
    .limit(5);
  
  if (sampleError) {
    console.error('Error fetching sample exercises:', sampleError);
    throw sampleError;
  }
  
  console.log('Sample exercises:');
  sampleExercises?.forEach(exercise => {
    console.log(`- ${exercise.name} (${exercise.category}, ${exercise.level})`);
    console.log(`  Muscles: ${exercise.primary_muscles.join(', ')}`);
    console.log(`  Images: ${exercise.images.length} found`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting exercise import process...\n');
    
    // Step 1: Fetch exercises data
    const exercisesData = await fetchExercisesData();
    
    // Step 2: Clear existing data (optional - comment out if you want to keep existing)
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearExistingExercises();
    }
    
    // Step 3: Import exercises
    await importExercises(exercisesData);
    
    // Step 4: Validate import
    await validateImport();
    
    console.log('\n🎉 Exercise import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main as importExercises };