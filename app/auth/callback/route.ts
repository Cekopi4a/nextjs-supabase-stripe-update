import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      console.log('Google Auth successful for user:', data.user.email);
      
      // Check if user profile exists, if not create it
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new profile for Google user');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'Google User',
            email: data.user.email,
            avatar_url: data.user.user_metadata.avatar_url,
            role: 'client', // Default role
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }
      }

      // Redirect to protected area
      return NextResponse.redirect(`${origin}/protected`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}