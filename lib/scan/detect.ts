import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";

export const CATALOG_KEYS = [
  "rice-cooker",
  "setrika",
  "mesin-cuci",
  "pompa",
  "ac",
  "water-heater",
  "microwave",
  "kipas",
  "tv",
  "komputer",
  "vacuum",
] as const;

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

const DetectionSchema = z.object({
  found: z.boolean(),
  appliance: z.string(),
  label: z.string(),
  catalog_key: z.enum([...CATALOG_KEYS, "none"]),
  watts: z.number(),
  va: z.number(),
  duration_minutes: z.number(),
  flexibility: z.enum(["fixed", "flexible"]),
  reading: z.enum(["nameplate", "recognition"]),
  confidence: z.enum(["high", "medium", "low"]),
  note: z.string(),
});

export type Detection = z.infer<typeof DetectionSchema>;

export type ScanResult =
  | { ok: true; detection: Detection }
  | { ok: false; error: string };

export const SUPPORTED_MEDIA = ["image/jpeg", "image/png", "image/webp"] as const;
export type SupportedMedia = (typeof SUPPORTED_MEDIA)[number];

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    appliance: { type: "string" },
    label: { type: "string" },
    catalog_key: { type: "string", enum: [...CATALOG_KEYS, "none"] },
    watts: { type: "number" },
    va: { type: "number" },
    duration_minutes: { type: "number" },
    flexibility: { type: "string", enum: ["fixed", "flexible"] },
    reading: { type: "string", enum: ["nameplate", "recognition"] },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    note: { type: "string" },
  },
  required: [
    "found",
    "appliance",
    "label",
    "catalog_key",
    "watts",
    "va",
    "duration_minutes",
    "flexibility",
    "reading",
    "confidence",
    "note",
  ],
};

const SYSTEM = `Kamu membantu aplikasi Farad mengenali alat listrik rumah tangga di Indonesia dari sebuah foto.

Aturan:
1. Kenali alat listrik apa yang terlihat. Kalau foto tidak memuat alat listrik rumah tangga, isi found=false dan jelaskan singkat di note.
2. Kalau label daya (stiker spesifikasi di badan alat) terbaca, PAKAI angka itu. Isi reading="nameplate" dan sebutkan angka yang kamu baca di note.
3. Kalau labelnya tidak terbaca, perkirakan dari jenis alatnya memakai rata-rata alat rumah tangga Indonesia. Isi reading="recognition".
4. watts adalah daya nyata. va adalah daya semu: untuk alat resistif (setrika, rice cooker, pemanas air, microwave) va sama dengan watts; untuk alat bermotor atau berkompresor (mesin cuci, pompa air, AC, vacuum) va kira-kira watts dibagi 0,8.
5. duration_minutes adalah perkiraan lama pemakaian sekali jalan, bulatkan ke kelipatan 15 menit.
6. flexibility="fixed" kalau jamnya biasanya terikat kebutuhan seperti rice cooker jam makan atau pompa air, "flexible" kalau bisa digeser.
7. catalog_key diisi kunci yang paling cocok, atau "none" kalau tidak ada yang cocok.
8. label adalah nama kegiatan singkat dalam bahasa Indonesia, misalnya "Masak nasi". appliance adalah nama alatnya, misalnya "Rice cooker".
9. note maksimal satu kalimat pendek, bahasa Indonesia, tanpa tanda hubung panjang.

Kalau found=false, tetap isi field lain dengan nilai netral: angka 0 dan catalog_key "none".`;

export async function detectAppliance(
  base64: string,
  mediaType: SupportedMedia,
): Promise<ScanResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      ok: false,
      error: "Scan belum aktif. Isi GEMINI_API_KEY di .env.local, lalu jalankan ulang server.",
    };
  }

  const ai = new GoogleGenAI({ apiKey: key });
  let quotaHit = false;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: mediaType, data: base64 } },
              { text: "Alat listrik apa ini, dan berapa dayanya? Baca label dayanya kalau terlihat." },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM,
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const text = response.text;
      if (!text) continue;

      const parsed = DetectionSchema.safeParse(JSON.parse(text));
      if (!parsed.success) continue;

      return { ok: true, detection: parsed.data };
    } catch (error) {
      const status = (error as { status?: number })?.status ?? null;
      if (status === 429) quotaHit = true;
      if (status === 401 || status === 403) {
        return { ok: false, error: "GEMINI_API_KEY tidak valid atau belum diizinkan." };
      }
    }
  }

  if (quotaHit) {
    return {
      ok: false,
      error: "Kuota harian Gemini sudah habis. Coba lagi besok, atau isi alatnya manual dulu.",
    };
  }

  return { ok: false, error: "Gagal membaca foto. Coba potret ulang lebih dekat ke label dayanya." };
}
