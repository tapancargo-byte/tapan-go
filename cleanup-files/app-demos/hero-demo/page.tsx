import React from "react";
import { FinancialHero } from "@/components/ui/hero-section";

const FinancialHeroDemo = () => {
  return (
    <div className="w-full bg-background">
      <FinancialHero
        title={
          <>
            Ready to transform your <br />
            <span className="text-primary">cargo operations?</span>
          </>
        }
        description="Experience a HUD-style view of your Northeast–Delhi lanes and keep every shipment on track."
        buttonText="Download app"
        buttonLink="#"
        imageUrl1="https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1200&q=80"
        imageUrl2="https://plus.unsplash.com/premium_photo-1664013263421-91e3a8101259?auto=format&fit=crop&w=1200&q=80"
      />
    </div>
  );
};

export default FinancialHeroDemo;
