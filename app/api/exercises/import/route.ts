import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ExerciseFromAPI } from '@/lib/types/exercises';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EXERCISES_JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGES_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export async function POST(request: NextRequest) {
  try {
    const { clearExisting = false } = await request.json();
    
    // For development, allow creating table without auth
    const isDev = process.env.NODE_ENV === 'development';
    const authHeader = request.headers.get('Authorization');
    
    if (!isDev && !authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if table exists
    const { error: tableCheckError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Exercises table does not exist. Please run the SQL script from create-exercises-table.sql in your Supabase dashboard first.',
        message: 'Database table not found'
      }, { status: 400 });
    }
    
    // Fetch exercises data
    console.log('Fetching exercises from GitHub...');
    const response = await fetch(EXERCISES_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status}`);
    }
    
    const exercisesData: ExerciseFromAPI[] = await response.json();
    console.log(`Fetched ${exercisesData.length} exercises`);
    
    // Check if table exists and clear if requested
    if (clearExisting) {
      console.log('Checking if table exists and clearing...');
      const { error: clearError } = await supabase
        .from('exercises')
        .delete()
        .neq('id', '');
      
      if (clearError && !clearError.message.includes('does not exist')) {
        throw new Error(`Failed to clear existing exercises: ${clearError.message}`);
      }
      
      if (clearError && clearError.message.includes('does not exist')) {
        console.log('Table does not exist yet, skipping clear operation');
      } else {
        console.log('✅ Cleared existing exercises');
      }
    }
    
    // Transform and prepare exercises for import
    const transformedExercises = exercisesData.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      force: exercise.force,
      level: exercise.level,
      mechanic: exercise.mechanic,
      equipment: exercise.equipment || 'body_only', // Default equipment if null
      primary_muscles: exercise.primaryMuscles || [],
      secondary_muscles: exercise.secondaryMuscles || [],
      instructions: exercise.instructions || [],
      category: exercise.category,
      images: exercise.images?.map(imagePath => `${IMAGES_BASE_URL}${imagePath}`) || [],
    }));
    
    // Import in batches
    const batchSize = 50;
    let importedCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < transformedExercises.length; i += batchSize) {
      const batch = transformedExercises.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('exercises')
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message || 'Unknown error'}`;
        console.error('Batch error details:', error);
        errors.push(errorMsg);
      } else {
        importedCount += batch.length;
        console.log(`Imported batch ${Math.floor(i / batchSize) + 1}: ${importedCount}/${transformedExercises.length}`);
      }
    }
    
    // Get final count
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    const result = {
      success: true,
      message: `Successfully imported exercises`,
      stats: {
        attempted: transformedExercises.length,
        imported: importedCount,
        totalInDatabase: count,
        errors: errors.length,
      },
      errors: errors
    };
    
    console.log('Import completed:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to import exercises'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return current exercise count and stats
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Failed to get exercise count: ${countError.message}`);
    }
    
    // Get some sample data
    const { data: categories, error: catError } = await supabase
      .from('exercises')
      .select('category')
      .not('category', 'is', null);
    
    if (catError) {
      throw new Error(`Failed to get categories: ${catError.message}`);
    }
    
    const categoryStats = categories?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      totalExercises: count,
      categoriesCount: Object.keys(categoryStats || {}).length,
      categoryBreakdown: categoryStats,
      status: 'Database ready'
    });
    
  } catch (error) {
    console.error('Failed to get exercise stats:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get exercise statistics'
      },
      { status: 500 }
    );
  }
}