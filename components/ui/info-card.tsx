import React, { useRef, useState } from "react";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  shadowColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontFamily?: string;
  rtlFontFamily?: string;
  effectBgColor?: string;
  contentPadding?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  width = 388,
  height = 378,
  borderColor,
  borderBgColor,
  borderWidth = 3,
  borderPadding = 14,
  cardBgColor,
  shadowColor,
  patternColor1,
  patternColor2,
  textColor,
  hoverTextColor,
  fontFamily,
  rtlFontFamily,
  effectBgColor,
  contentPadding = "10px 16px",
}) => {
  // Use CSS custom properties as defaults (oklch-based from globals.css)
  const resolvedBorderColor = borderColor || "var(--border-color-1)";
  const resolvedBorderBgColor = borderBgColor || "var(--border-bg-color)";
  const resolvedCardBgColor = cardBgColor || "var(--card-bg-color)";
  const resolvedShadowColor = shadowColor || "var(--shadow-color)";
  const resolvedPatternColor1 = patternColor1 || "var(--pattern-color1)";
  const resolvedPatternColor2 = patternColor2 || "var(--pattern-color2)";
  const resolvedTextColor = textColor || "var(--text-color)";
  const resolvedHoverTextColor = hoverTextColor || "var(--hover-text-color-1)";
  const resolvedFontFamily = fontFamily || "var(--font-family)";
  const resolvedRtlFontFamily = rtlFontFamily || "var(--rtl-font-family)";
  const resolvedEffectBgColor = effectBgColor || "var(--border-color-1)";
  const [hovered, setHovered] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
  };

  const rtl = isRTL(title) || isRTL(description);
  const effectiveFont = rtl ? resolvedRtlFontFamily : resolvedFontFamily;
  const titleDirection = isRTL(title) ? "rtl" : "ltr";
  const descDirection = isRTL(description) ? "rtl" : "ltr";

  const innerWidth = 354;
  const innerHeight = 344;

  const pattern =
    `linear-gradient(45deg, ${resolvedPatternColor1} 25%, transparent 25%, transparent 75%, ${resolvedPatternColor2} 75%),` +
    `linear-gradient(-45deg, ${resolvedPatternColor2} 25%, transparent 25%, transparent 75%, ${resolvedPatternColor1} 75%)`;

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${resolvedBorderColor} 0deg, ${resolvedBorderColor} 90deg, ${resolvedBorderBgColor} 90deg, ${resolvedBorderBgColor} 360deg)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (borderRef.current)
          borderRef.current.style.setProperty("--rotation", "0deg");
      }}
      style={{
        width,
        height,
        border: `${borderWidth}px solid transparent`,
        borderRadius: "1em",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundImage: `linear-gradient(${resolvedCardBgColor}, ${resolvedCardBgColor}), ${borderGradient}`,
        padding: borderPadding,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        transition: "box-shadow 0.3s",
        position: "relative",
        fontFamily: effectiveFont,
      } as React.CSSProperties}
    >
      <div
        style={{
          width: innerWidth,
          height: innerHeight,
          borderRadius: "1em",
          background: resolvedCardBgColor,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundImage: pattern,
          backgroundSize: "20.84px 20.84px",
          padding: "0 0 8px 0",
        }}
      >
        <div style={{ width: "100%", position: "relative", overflow: "hidden" }}>
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: contentPadding,
            minHeight: 0,
          }}
        >
          <h1
            style={{
              fontSize: 21,
              fontWeight: "bold",
              letterSpacing: "-.01em",
              lineHeight: "normal",
              marginBottom: 5,
              color: hovered ? resolvedHoverTextColor : resolvedTextColor,
              transition: "color 0.3s ease",
              position: "relative",
              overflow: "hidden",
              direction: titleDirection,
              width: "auto",
            }}
          >
            <span
              style={{
                position: "relative",
                zIndex: 10,
                padding: "2px 4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {title}
            </span>
            <span
              style={{
                clipPath: hovered
                  ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
                transformOrigin: "center",
                transition: "all cubic-bezier(.1,.5,.5,1) 0.4s",
                position: "absolute",
                left: -4,
                right: -4,
                top: -4,
                bottom: -4,
                zIndex: 0,
                backgroundColor: resolvedEffectBgColor,
              }}
            />
          </h1>
          <p
            style={{
              fontSize: 14,
              color: resolvedTextColor,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              direction: descDirection,
              marginBottom: 0,
              paddingBottom: 0,
              minHeight: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
