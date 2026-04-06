// app/api/upload/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ActivityType } from "@/lib/generated/prisma/enums";
import sharp from "sharp";
import { mkdir, writeFile, unlink, access } from "fs/promises";
import path from "path";

const AVATAR_SIZE = 256;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/** Async check if file exists — no blocking sync fs calls */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 Auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📦 Read form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 🖼️ Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // 📏 Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image must be less than 2MB" },
        { status: 400 }
      );
    }

    // 🔄 Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🧠 Resize & compress
    const optimizedBuffer = await sharp(buffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .jpeg({ quality: 70 })
      .toBuffer();

    // 📁 Ensure avatar directory exists
    const avatarDir = path.join(process.cwd(), "public", "avatars");
    await mkdir(avatarDir, { recursive: true });

    // 🧾 Save file — always {userId}.jpg (overwrites previous)
    const fileName = `${session.user.id}.jpg`;
    const filePath = path.join(avatarDir, fileName);

    await writeFile(filePath, optimizedBuffer);

    // 🌐 Public URL with cache buster
    const timestamp = Date.now();
    const avatarUrl = `/avatars/${fileName}?t=${timestamp}`;

    // 🗄️ Update DB
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatar: avatarUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        avatar: true,
        name: true,
      },
    });

    // 🧾 Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: ActivityType.USER_LOGIN,
        action: "Updated profile avatar",
      },
    });

    // ✅ Return the new avatar URL
    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Remove DB reference
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatar: null,
        updatedAt: new Date(),
      },
    });

    // Remove file (async, no blocking)
    const filePath = path.join(
      process.cwd(),
      "public",
      "avatars",
      `${session.user.id}.jpg`
    );

    if (await fileExists(filePath)) {
      await unlink(filePath);
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: ActivityType.USER_LOGIN,
        action: "Removed profile avatar",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}