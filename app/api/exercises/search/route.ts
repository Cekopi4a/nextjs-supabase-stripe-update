import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ExerciseSearchFilters } from '@/lib/types/exercises';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: ExerciseSearchFilters = {
      searchTerm: searchParams.get('search') || undefined,
      level: (searchParams.get('level') as 'beginner' | 'intermediate' | 'expert') || undefined,
      category: (searchParams.get('category') as 'strength' | 'cardio' | 'flexibility' | 'plyometrics' | 'strongman' | 'powerlifting' | 'olympic_weightlifting') || undefined,
      equipment: searchParams.get('equipment') || undefined,
      primaryMuscle: searchParams.get('muscle') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    
    console.log('Exercise search filters:', filters);
    
    // Build the query
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    // Apply filters
    if (filters.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }
    
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.equipment) {
      query = query.ilike('equipment', `%${filters.equipment}%`);
    }
    
    if (filters.primaryMuscle) {
      query = query.contains('primary_muscles', [filters.primaryMuscle]);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: exercises, error } = await query;
    
    if (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
    
    console.log(`Found ${exercises?.length || 0} exercises`);
    
    return NextResponse.json({
      success: true,
      data: exercises || [],
      count: exercises?.length || 0,
      filters: filters
    });
    
  } catch (error) {
    console.error('Exercise search failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to search exercises'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters: ExerciseSearchFilters = await request.json();
    
    console.log('Exercise search with POST filters:', filters);
    
    // Use the stored function for more complex searches
    const { data, error } = await supabase
      .rpc('search_exercises', {
        search_term: filters.searchTerm || null,
        filter_level: filters.level || null,
        filter_category: filters.category || null,
        filter_equipment: filters.equipment || null,
        filter_primary_muscle: filters.primaryMuscle || null,
        limit_count: filters.limit || 50
      });
    
    if (error) {
      console.error('RPC search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
    
    console.log(`RPC search found ${data?.length || 0} exercises`);
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      filters: filters
    });
    
  } catch (error) {
    console.error('Exercise RPC search failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to search exercises'
      },
      { status: 500 }
    );
  }
}