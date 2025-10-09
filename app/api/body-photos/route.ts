import { createSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const photoType = formData.get("photoType") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!photoType || !["front", "back", "side_left", "side_right"].includes(photoType)) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload images (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${date}_${photoType}_${Date.now()}.${fileExtension}`;
    const filePath = `${user.id}/${uniqueFilename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { error: uploadError } = await client.storage
      .from("body-photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        duplex: "half"
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from("body-photos")
      .getPublicUrl(filePath);

    // Save to database
    const { data, error: dbError } = await client
      .from("body_photos")
      .insert({
        client_id: user.id,
        date,
        photo_type: photoType,
        photo_url: urlData.publicUrl,
        notes: notes || null
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Try to delete uploaded file
      await client.storage.from("body-photos").remove([filePath]);
      return NextResponse.json({ error: "Failed to save photo data" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      photo: data
    });

  } catch (error) {
    console.error("Error in body photo upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let query = client
      .from("body_photos")
      .select("*")
      .eq("client_id", user.id)
      .order("date", { ascending: false });

    if (date) {
      query = query.eq("date", date);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
    }

    return NextResponse.json({ photos: data || [] });

  } catch (error) {
    console.error("Error fetching body photos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await createSupabaseClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Get photo data to find the file path
    const { data: photo, error: fetchError } = await client
      .from("body_photos")
      .select("photo_url, client_id")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.client_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extract file path from URL
    const urlParts = photo.photo_url.split("/body-photos/");
    const filePath = urlParts[1];

    // Delete from storage
    if (filePath) {
      await client.storage.from("body-photos").remove([filePath]);
    }

    // Delete from database
    const { error: deleteError } = await client
      .from("body_photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting body photo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
