import { NextResponse } from "next/server"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"

const DEFAULT_SCHEMA = [
  {
    table_name: "users",
    description: "Registered user accounts and credentials",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false, description: "Unique user identifier" },
      { name: "email", type: "VARCHAR(255)", is_primary_key: false, is_foreign_key: false, description: "Unique user email" },
      { name: "name", type: "VARCHAR(100)", is_primary_key: false, is_foreign_key: false, description: "Full user display name" },
      { name: "role", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false, description: "Role: customer, admin, merchant" },
      { name: "is_active", type: "BOOLEAN", is_primary_key: false, is_foreign_key: false, description: "Active account flag" },
      { name: "created_at", type: "TIMESTAMPTZ", is_primary_key: false, is_foreign_key: false, description: "Registration timestamp" },
    ],
  },
  {
    table_name: "products",
    description: "Catalog items available for purchase",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false, description: "Unique product ID" },
      { name: "name", type: "VARCHAR(255)", is_primary_key: false, is_foreign_key: false, description: "Product title" },
      { name: "category", type: "VARCHAR(100)", is_primary_key: false, is_foreign_key: false, description: "Product category taxonomy" },
      { name: "price", type: "NUMERIC(10,2)", is_primary_key: false, is_foreign_key: false, description: "Unit retail price" },
      { name: "stock_quantity", type: "INTEGER", is_primary_key: false, is_foreign_key: false, description: "Current inventory stock" },
      { name: "is_available", type: "BOOLEAN", is_primary_key: false, is_foreign_key: false, description: "Availability flag" },
    ],
  },
  {
    table_name: "orders",
    description: "Customer transactions and purchase orders",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false, description: "Unique order ID" },
      { name: "user_id", type: "UUID", is_primary_key: false, is_foreign_key: true, references: "users(id)", description: "Purchasing user ID" },
      { name: "total_amount", type: "NUMERIC(12,2)", is_primary_key: false, is_foreign_key: false, description: "Final checkout amount" },
      { name: "status", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false, description: "pending, completed, refunded" },
      { name: "created_at", type: "TIMESTAMPTZ", is_primary_key: false, is_foreign_key: false, description: "Order placement timestamp" },
    ],
  },
]

export async function GET(request) {
  try {
    const { search } = new URL(request.url)
    const proxyData = await proxyToBackendIfAvailable(`/api/clarification/schema${search}`, "GET")
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    return NextResponse.json({
      database_type: "Cloud PostgreSQL (Supabase / Neon / AWS RDS)",
      tables: DEFAULT_SCHEMA,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch schema" },
      { status: 500 }
    )
  }
}
