import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
  console.log("Please set these in backend/.dev.vars")
  process.exit(1)
}

console.log("🔌 Testing Supabase connection...")
console.log(`URL: ${supabaseUrl.substring(0, 30)}...`)

const supabase = createClient(supabaseUrl, supabaseKey)

// Test 1: Count facts
;(async () => {
  try {
    const { count, error } = await supabase
      .from("facts")
      .select("*", { count: "exact", head: true })

    if (error) throw error

    console.log(`✅ Connected! Found ${count} facts in database`)

    // Test 2: Query by tags
    const { data: aiF acts, error: queryError } = await supabase
      .from("facts")
      .select("quote, tags")
      .overlaps("tags", ["AI"])
      .limit(3)

    if (queryError) throw queryError

    console.log(`✅ Tag query works! Found ${aiFacts?.length} AI-related facts:`)
    aiFacts?.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.quote.substring(0, 60)}...`)
    })

    console.log("\n🎉 Database setup complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Start backend: cd backend && pnpm dev")
    console.log("2. Test API: curl http://localhost:8787/api/jit_fetch \\")
    console.log('   -X POST -H "Content-Type: application/json" \\')
    console.log('   -d \'{"topic":"AI","collections":["AI"],"limit":5}\'')
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
})()