/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    console.log("API Key exists:", !!apiKey); // ADD THIS
    
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    
    console.log("File received:", file); // ADD THIS
    console.log("FormData keys:", [...formData.keys()]); // ADD THIS

    if (!formData.get("model")) {
      formData.set("model", "whisper-1");
    }

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error); // ADD THIS
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });

  } catch (err: any) {
    console.error("Route crash:", err.message); // ADD THIS
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}