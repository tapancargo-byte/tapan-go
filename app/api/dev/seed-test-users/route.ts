import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Location } from "@/types/auth";

type Role = "admin";  // Only admin role for this dashboard

async function ensureUser(
  email: string, 
  password: string, 
  role: Role, 
  name: string,
  location: Location = "imphal"
) {
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = listData?.users?.find((u: any) => u.email === email) ?? null;

  let user = existing;

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw error ?? new Error("Failed to create user");
    }

    user = data.user;
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });
    if (error) {
      throw error;
    }
  }

  const { error: upsertError } = await supabaseAdmin
    .from("users")
    .upsert({
      id: user.id,
      email,
      role,
      name,
      location,
    });

  if (upsertError) {
    throw upsertError;
  }

  return { id: user.id as string, email, role, location };
}

async function seedTestUsers() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const users = [] as { id: string; email: string; role: Role; location: Location }[];

    // Create Imphal admin
    users.push(
      await ensureUser(
        "admin@tapango.logistics",
        "Test@1498",
        "admin",
        "Imphal Admin",
        "imphal",
      ),
    );

    // Create New Delhi admin
    users.push(
      await ensureUser(
        "delhi@tapango.logistics",
        "Test@1498",
        "admin",
        "Delhi Admin",
        "newdelhi",
      ),
    );

    // Seed test shipments for both locations
    const shipments = [
      {
        shipment_ref: "TAP-IXA-001",
        origin: "Imphal, MN",
        destination: "New Delhi, DL",
        weight: 150.5,
        status: "In Transit",
        progress: 45,
        location: "imphal",
      },
      {
        shipment_ref: "TAP-DEL-001",
        origin: "New Delhi, DL",
        destination: "Imphal, MN",
        weight: 200.0,
        status: "Pending",
        progress: 10,
        location: "newdelhi",
      },
    ];

    for (const shipment of shipments) {
      const { error: shipError } = await supabaseAdmin.from("shipments").upsert(
        shipment,
        { onConflict: "shipment_ref" },
      );
      if (shipError) {
        console.warn(`Failed to seed shipment ${shipment.shipment_ref}:`, shipError.message);
      }
    }

    // Seed test inventory for both locations
    const inventoryItems = [
      {
        sku: "INV-IXA-001",
        description: "Electronics - Smartphones",
        current_stock: 150,
        min_stock: 20,
        location: "imphal",
      },
      {
        sku: "INV-IXA-002",
        description: "Textiles - Cotton Fabric",
        current_stock: 500,
        min_stock: 100,
        location: "imphal",
      },
      {
        sku: "INV-IXA-003",
        description: "Food - Dried Spices",
        current_stock: 75,
        min_stock: 50,
        location: "imphal",
      },
      {
        sku: "INV-DEL-001",
        description: "Machinery Parts",
        current_stock: 200,
        min_stock: 30,
        location: "newdelhi",
      },
      {
        sku: "INV-DEL-002",
        description: "Pharmaceuticals",
        current_stock: 1000,
        min_stock: 200,
        location: "newdelhi",
      },
      {
        sku: "INV-DEL-003",
        description: "Automotive Components",
        current_stock: 15,
        min_stock: 25,
        location: "newdelhi",
      },
    ];

    for (const item of inventoryItems) {
      const { error: invError } = await supabaseAdmin.from("inventory_items").upsert(
        item,
        { onConflict: "sku" },
      );
      if (invError) {
        console.warn(`Failed to seed inventory ${item.sku}:`, invError.message);
      }
    }

    // Seed test customers for both locations
    const customers = [
      {
        name: "Imphal Traders Co.",
        email: "traders@imphal.com",
        phone: "+91-9876543210",
        city: "Imphal",
        location: "imphal",
      },
      {
        name: "Delhi Exports Ltd.",
        email: "exports@delhi.com",
        phone: "+91-9876543211",
        city: "New Delhi",
        location: "newdelhi",
      },
    ];

    for (const customer of customers) {
      const { error: custError } = await supabaseAdmin.from("customers").upsert(
        customer,
        { onConflict: "email" },
      );
      if (custError) {
        console.warn(`Failed to seed customer ${customer.name}:`, custError.message);
      }
    }

    return NextResponse.json({ ok: true, users });
  } catch (err: any) {
    console.error("Seed test users error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  return seedTestUsers();
}

export async function GET() {
  return seedTestUsers();
}
