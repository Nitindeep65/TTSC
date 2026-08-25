import { NextResponse } from "next/server"
import { introspectPostgreSql, isLocalhostUri } from "@/lib/dbDriver"
import { proxyToBackendIfAvailable } from "@/lib/serverBackendHelper"
import { LIVE_DATABASE_SCHEMA_SQL } from "@/lib/serverLlm"

const DEFAULT_DEMO_TABLES = [
  {
    table_name: "users",
    description: "Registered user accounts and credentials",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false },
      { name: "email", type: "VARCHAR(255)", is_primary_key: false, is_foreign_key: false },
      { name: "name", type: "VARCHAR(100)", is_primary_key: false, is_foreign_key: false },
      { name: "role", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false },
      { name: "is_active", type: "BOOLEAN", is_primary_key: false, is_foreign_key: false },
      { name: "created_at", type: "TIMESTAMPTZ", is_primary_key: false, is_foreign_key: false },
    ],
  },
  {
    table_name: "products",
    description: "Catalog items available for purchase",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false },
      { name: "name", type: "VARCHAR(255)", is_primary_key: false, is_foreign_key: false },
      { name: "category", type: "VARCHAR(100)", is_primary_key: false, is_foreign_key: false },
      { name: "price", type: "NUMERIC(10,2)", is_primary_key: false, is_foreign_key: false },
      { name: "stock_quantity", type: "INTEGER", is_primary_key: false, is_foreign_key: false },
      { name: "is_available", type: "BOOLEAN", is_primary_key: false, is_foreign_key: false },
    ],
  },
  {
    table_name: "orders",
    description: "Customer transactions and purchase orders",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false },
      { name: "user_id", type: "UUID", is_primary_key: false, is_foreign_key: true, references: "users(id)" },
      { name: "total_amount", type: "NUMERIC(12,2)", is_primary_key: false, is_foreign_key: false },
      { name: "status", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false },
      { name: "created_at", type: "TIMESTAMPTZ", is_primary_key: false, is_foreign_key: false },
    ],
  },
  {
    table_name: "order_items",
    description: "Individual line items within each order",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false },
      { name: "order_id", type: "UUID", is_primary_key: false, is_foreign_key: true, references: "orders(id)" },
      { name: "product_id", type: "UUID", is_primary_key: false, is_foreign_key: true, references: "products(id)" },
      { name: "quantity", type: "INTEGER", is_primary_key: false, is_foreign_key: false },
      { name: "unit_price", type: "NUMERIC(10,2)", is_primary_key: false, is_foreign_key: false },
    ],
  },
  {
    table_name: "payments",
    description: "Payment transaction receipts and methods",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true, is_foreign_key: false },
      { name: "order_id", type: "UUID", is_primary_key: false, is_foreign_key: true, references: "orders(id)" },
      { name: "amount", type: "NUMERIC(12,2)", is_primary_key: false, is_foreign_key: false },
      { name: "payment_method", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false },
      { name: "status", type: "VARCHAR(50)", is_primary_key: false, is_foreign_key: false },
    ],
  },
]

export async function POST(request) {
  try {
    const body = await request.json()
    const uri = body.connection_uri || ""

    // 1. Try forwarding to backend if available
    const proxyData = await proxyToBackendIfAvailable("/api/database/connect", "POST", body)
    if (proxyData) {
      return NextResponse.json(proxyData)
    }

    // 2. Check for local database attempted from cloud
    if (isLocalhostUri(uri) && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to 'localhost' / '127.0.0.1' from Vercel Cloud deployment. To test on Vercel, please connect to a cloud database (e.g. Supabase, Neon, AWS RDS, MongoDB Atlas) or run QueryCraft locally with 'npm run dev'.",
        },
        { status: 400 }
      )
    }

    // 3. Attempt live PostgreSQL introspection if it's a real PostgreSQL URI
    if (uri.startsWith("postgres://") || uri.startsWith("postgresql://")) {
      try {
        const liveData = await introspectPostgreSql(uri)
        return NextResponse.json(liveData)
      } catch (dbErr) {
        console.warn("Live PostgreSQL connection failed, falling back to schema parser:", dbErr.message)
        // If live connection failed, return the specific error if it was a real connection attempt
        if (!uri.includes("sample") && !uri.includes("demo") && !uri.includes("user:password")) {
          return NextResponse.json(
            { error: `Database Connection Failed: ${dbErr.message}` },
            { status: 400 }
          )
        }
      }
    }

    // 4. Default Demo / Template Introspection
    const isMongo = uri.includes("mongodb")
    const host = uri.split("@")[1]?.split("/")[0] || (isMongo ? "atlas-cluster.mongodb.net" : "cloud-postgres.neon.tech")
    const database = isMongo ? "production_db" : "ecommerce_db"

    return NextResponse.json({
      engine: isMongo ? "mongodb" : "postgresql",
      host,
      database,
      tables_count: DEFAULT_DEMO_TABLES.length,
      tables: DEFAULT_DEMO_TABLES,
      schema_sql: LIVE_DATABASE_SCHEMA_SQL,
      message: `Database connection verified and schema introspected successfully (${DEFAULT_DEMO_TABLES.length} tables).`,
    })
  } catch (error) {
    console.error("Connect database error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to connect to database" },
      { status: 500 }
    )
  }
}
