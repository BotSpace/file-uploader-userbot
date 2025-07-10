import { NextRequest, NextResponse } from "next/server";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

// .env fayldan ma'lumotlarni o'qish
const apiId = parseInt(process.env.API_ID || "0");
const apiHash = process.env.API_HASH || "";
const sessionString = process.env.SESSION_STRING || "";

// Muhim tekshiruv
if (!apiId || !apiHash || !sessionString) {
  throw new Error(
    "Iltimos, .env.local faylini API_ID, API_HASH, va SESSION_STRING bilan to'ldiring va serverni qayta ishga tushuring."
  );
}

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

// POST so'rovlari uchun nomlangan eksport
export async function POST(req: NextRequest) {
  try {
    // 1. Next.js ning o'zida form-data'ni parse qilish
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Fayl topilmadi." },
        { status: 400 }
      );
    }

    // 2. Faylni buffer'ga o'tkazish
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Telegram client'ga ulanish va faylni yuborish
    await client.connect();
    console.log("🚀 Telegramga ulanildi. Fayl yuborilmoqda...");

    await client.sendFile("me", {
      file: buffer,
      caption: `Fayl nomi: ${file.name}\n\n🤖 Next.js orqali yuborildi.`,
      // Fayl nomini Telegramda to'g'ri ko'rsatish uchun
      attributes: [
        new Api.DocumentAttributeFilename({
          fileName: file.name,
        }),
      ],
    });

    console.log("✅ Fayl muvaffaqiyatli yuborildi!");

    // Javobni NextResponse orqali qaytarish
    return NextResponse.json({
      success: true,
      message: "Fayl 'Saved Messages'ga muvaffaqiyatli yuborildi!",
    });
  } catch (error: any) {
    console.error("❌ Fayl yuborishda xatolik:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Serverda noma'lum xatolik yuz berdi.",
      },
      { status: 500 }
    );
  } finally {
    if (client.connected) {
      await client.disconnect();
      console.log("🔌 Telegramdan uzildi.");
    }
  }
}

// GET so'roviga javob
export async function GET() {
  return NextResponse.json(
    { message: "Iltimos, fayl yuborish uchun POST so'rovini ishlating." },
    { status: 405 }
  );
}
