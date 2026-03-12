import { ImageResponse } from "next/og";
import { fetchBusinessConfig } from "@/lib/fetch-functions/business";

export const runtime = "nodejs";
export const alt = "Passao Fast Food";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// oklch(0.82 0.17 90) ≈ #e8b800
const PRIMARY = "#e8b800";
const PRIMARY_DARK = "#0a0905";
const BG = "#0d0d0a";

export default async function Image() {
  const config = await fetchBusinessConfig().catch(() => null);

  const name = config?.name ?? "PASSAO";
  const city = config?.city ?? "Montería";
  const slogan = config?.slogan ?? "Las mejores arepas, perros y patacones de la ciudad.";
  const initial = name.charAt(0).toUpperCase();

  const stats = [
    { value: `${config?.heroStatArepas ?? 12}+`, label: "Tipos de Arepas" },
    { value: `${config?.heroStatPerros ?? 5}+`, label: "Perros Calientes" },
    { value: `${config?.heroStatPatacones ?? 10}+`, label: "Patacones" },
    { value: `${config?.heroStatTotal ?? 30}+`, label: "Productos" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Warm overlay gradient to mimic photo+overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(60,40,0,0.45) 0%, rgba(10,9,5,0.95) 80%)",
            display: "flex",
          }}
        />

        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(232,184,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,0,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
            width: "100%",
            padding: "0 80px",
          }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              background: "#000000",
              border: `3px solid ${PRIMARY}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              boxShadow: `0 0 32px rgba(232,184,0,0.3)`,
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: PRIMARY,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "100px",
              fontWeight: "bold",
              color: PRIMARY,
              letterSpacing: "-2px",
              lineHeight: 1,
              marginBottom: "16px",
              textShadow: `0 4px 24px rgba(232,184,0,0.4)`,
            }}
          >
            {name}
          </div>

          {/* Slogan */}
          <div
            style={{
              fontSize: "26px",
              color: "#e5e5e5",
              marginBottom: "40px",
              textAlign: "center",
              maxWidth: "700px",
              opacity: 0.9,
            }}
          >
            {slogan}
          </div>

          {/* CTA pill */}
          <div
            style={{
              background: PRIMARY,
              borderRadius: "10px",
              padding: "14px 40px",
              color: PRIMARY_DARK,
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "48px",
              letterSpacing: "0.3px",
            }}
          >
            Ordena Ahora · Domicilio y Recogida
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(232,184,0,0.2)",
                  borderRadius: "10px",
                  padding: "14px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "130px",
                }}
              >
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: PRIMARY,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#a3a3a3",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* City badge — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "40px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(232,184,0,0.12)",
            border: "1px solid rgba(232,184,0,0.3)",
            borderRadius: "999px",
            padding: "6px 16px",
          }}
        >
          <span style={{ fontSize: "16px", color: PRIMARY }}>📍 {city}, Colombia</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
