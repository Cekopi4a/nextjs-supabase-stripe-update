import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the search API
    const searchResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/exercises/search?limit=10`);
    const searchResult = await searchResponse.json();
    
    // Test the import API statistics
    const statsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/exercises/import`);
    const statsResult = await statsResponse.json();
    
    return NextResponse.json({
      success: true,
      tests: {
        search: {
          success: searchResult.success,
          count: searchResult.count,
          dataPresent: !!searchResult.data?.length
        },
        import: {
          totalExercises: statsResult.totalExercises,
          categoriesCount: statsResult.categoriesCount,
          status: statsResult.status
        }
      }
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed'
      },
      { status: 500 }
    );
  }
}