import React from "react";
import type { CSSProperties } from "react";
import { InfoCard } from "@/components/ui/info-card";

const containerStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  padding: 24,
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  background: "none",
  fontFamily: "var(--font-family)",
  margin: 0,
};

const fileContainerStyle: CSSProperties = {
  width: 388,
  height: 378,
  borderRadius: "1em",
  position: "relative",
  overflow: "hidden",
  padding: 0,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "none",
  boxSizing: "border-box",
};

export default function InfoCardDemo() {
  return (
    <div className="container" style={containerStyle}>
      <div
        className="file-container"
        id="container1"
        style={{
          ...fileContainerStyle,
          ["--hover-text-color" as any]: "#242424",
        }}
      >
        <InfoCard
          image="https://images.unsplash.com/photo-1567777285486-8af9bfd5d7db?auto=format&fit=crop&w=1920&q=80"
          title="American English"
          description="Master American English efficiently with personalized lessons, cultural insights, and practical exercises."
          borderColor="var(--border-color-1)"
          borderBgColor="var(--border-bg-color)"
          cardBgColor="var(--card-bg-color)"
          shadowColor="var(--shadow-color)"
          textColor="var(--text-color)"
          hoverTextColor="var(--hover-text-color-1)"
          fontFamily="var(--font-family)"
          rtlFontFamily="var(--rtl-font-family)"
          effectBgColor="var(--border-color-1)"
          patternColor1="var(--pattern-color1)"
          patternColor2="var(--pattern-color2)"
          contentPadding="14.3px 16px"
        />
      </div>
      <div
        className="file-container"
        id="container2"
        style={{
          ...fileContainerStyle,
          ["--hover-text-color" as any]: "#fff",
        }}
      >
        <InfoCard
          image="https://images.unsplash.com/photo-1448906654166-444d494666b3?auto=format&fit=crop&w=1920&q=80"
          title="British English"
          description="Explore British English nuances, from pronunciation to idioms and dialect-specific words."
          borderColor="var(--border-color-2)"
          borderBgColor="var(--border-bg-color)"
          cardBgColor="var(--card-bg-color)"
          shadowColor="var(--shadow-color)"
          textColor="var(--text-color)"
          hoverTextColor="var(--hover-text-color-2)"
          fontFamily="var(--font-family)"
          rtlFontFamily="var(--rtl-font-family)"
          effectBgColor="var(--border-color-2)"
          patternColor1="var(--pattern-color1)"
          patternColor2="var(--pattern-color2)"
          contentPadding="14.3px 16px"
        />
      </div>
      <div
        className="file-container"
        id="container3"
        style={{
          ...fileContainerStyle,
          ["--hover-text-color" as any]: "#2196F3",
        }}
      >
        <InfoCard
          image="https://images.unsplash.com/photo-1618415112746-d999da95f609?auto=format&fit=crop&w=1920&q=80"
          title="עברית"
          description="לימוד השפה העברית המודרנית, דקדוק ואוצר מילים. שיפור מיומנויות דיבור וכתיבה, חקירת ספרות עברית. הכרת תרבות ישראלית, מנהגים והיסטוריה."
          borderColor="var(--border-color-3)"
          borderBgColor="var(--border-bg-color)"
          cardBgColor="var(--card-bg-color)"
          shadowColor="var(--shadow-color)"
          textColor="var(--text-color)"
          hoverTextColor="var(--hover-text-color-3)"
          fontFamily="var(--font-family)"
          rtlFontFamily="var(--rtl-font-family)"
          effectBgColor="var(--border-color-3)"
          patternColor1="var(--pattern-color1)"
          patternColor2="var(--pattern-color2)"
        />
      </div>
    </div>
  );
}
