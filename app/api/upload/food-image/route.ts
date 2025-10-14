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

    // Check if user is a trainer
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "trainer") {
      return NextResponse.json({ error: "Only trainers can upload food images" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images only for foods)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload images (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validate file size (5MB for food images)
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `foods/${user.id}/${uniqueFilename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage (using recipe-media bucket for now)
    const { error: uploadError } = await client.storage
      .from("recipe-media")
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
      .from("recipe-media")
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

  } catch (error) {
    console.error("Error in food image upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
