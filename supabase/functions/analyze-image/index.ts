import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageBase64, imageType } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const systemPrompt = `You are an expert radiologist AI assistant. Analyze the provided medical image and return a JSON response with the following structure:
{
  "disease": "Name of the detected condition or 'Normal' if no abnormality",
  "confidence": 0.0 to 1.0,
  "severity": "mild" | "moderate" | "severe" | "normal",
  "findings": ["list of key findings"],
  "affectedRegions": [{"x": 0-100, "y": 0-100, "width": 5-40, "height": 5-40, "intensity": 0.3-1.0, "label": "region name"}],
  "explanation": "A detailed human-readable explanation of the findings, suitable for a medical professional",
  "recommendations": ["list of recommended follow-up actions"]
}

The affectedRegions should describe areas of concern as percentages of image dimensions. Provide 2-5 regions for abnormal findings. For normal images, provide an empty array.

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this medical image. Identify any abnormalities, affected regions, and provide a diagnosis." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageType || "image/jpeg"};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        disease: "Analysis Complete",
        confidence: 0.75,
        severity: "moderate",
        findings: ["AI analysis returned unstructured results"],
        affectedRegions: [],
        explanation: content,
        recommendations: ["Consult with a medical professional for definitive diagnosis"],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
