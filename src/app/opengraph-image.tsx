import { ImageResponse } from "next/og";
import { fetchBusinessConfig } from "@/lib/fetch-functions/business";

export const runtime = "nodejs";
export const alt = "Passao Fast Food";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const config = await fetchBusinessConfig().catch(() => null);

  const name = config?.name ?? "PASSAO";
  const city = config?.city ?? "Montería";
  const slogan = config?.slogan ?? "Las mejores arepas, perros y patacones";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111800 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {/* Accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#a3e635",
          }}
        />

        {/* City badge */}
        <div
          style={{
            display: "flex",
            background: "rgba(163, 230, 53, 0.15)",
            border: "1px solid rgba(163, 230, 53, 0.4)",
            borderRadius: "999px",
            padding: "6px 20px",
            marginBottom: "24px",
          }}
        >
          <span style={{ color: "#a3e635", fontSize: "18px", fontWeight: 600 }}>
            📍 {city}, Colombia
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: "bold",
            color: "#a3e635",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          {name}
        </div>

        {/* Slogan */}
        <div
          style={{
            fontSize: "28px",
            color: "#e5e5e5",
            marginBottom: "40px",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          {slogan}
        </div>

        {/* Products row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {["🫓 Arepas", "🌭 Perros Calientes", "🍟 Patacones", "🥙 Suizos"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#d4d4d4",
                fontSize: "18px",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            background: "#a3e635",
            borderRadius: "10px",
            padding: "16px 40px",
            color: "#0a0a0a",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Ordena ahora · Domicilio y Recogida
        </div>

        {/* Accent bar bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "rgba(163, 230, 53, 0.3)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
