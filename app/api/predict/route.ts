import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    // Using the recommended Inference API endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: bytes,
      }
    );

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF Error Response:", errorText);

      // Try to parse as JSON, otherwise wrap in JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { 
          error: "Hugging Face API Error", 
          details: errorText.slice(0, 500), // Limit length in case it's a huge HTML page
          status: response.status 
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Check if response is actually JSON before parsing
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      return NextResponse.json({ error: "Unexpected response format", details: text.slice(0, 500) }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Predict Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
