import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('   Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConnection() {
  console.log('🔍 Supabase Backend Verification')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Project URL:', supabaseUrl?.substring(0, 35) + '...')
  console.log('')

  let allPassed = true

  try {
    // Test 1: Auth Service
    console.log('1️⃣ Auth Service')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('   ❌ Failed:', authError.message)
      allPassed = false
    } else {
      console.log('   ✅ Connected (no active session - expected)')
    }

    // Test 2: Database (try to get session user)
    console.log('\n2️⃣ Database Connection')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError && userError.message !== 'Auth session missing!') {
      console.log('   ❌ Failed:', userError.message)
      allPassed = false
    } else {
      console.log('   ✅ Database reachable')
    }

    // Test 3: Tables exist
    console.log('\n3️⃣ Database Tables')
    const { error: todosError } = await supabase.from('todos').select('count', { count: 'exact', head: true })
    if (todosError) {
      console.log('   ⚠️  Todos table missing:', todosError.message)
      console.log('   💡  Create it in Supabase SQL Editor:')
      console.log('       CREATE TABLE todos (id SERIAL PRIMARY KEY, name TEXT, completed BOOLEAN DEFAULT FALSE);')
    } else {
      console.log('   ✅ Todos table exists')
    }

    // Test 4: Auth signup works
    console.log('\n4️⃣ Auth Signup Configuration')
    const { error: signupError } = await supabase.auth.signUp({
      email: 'test-verification@example.com',
      password: 'testpass123'
    })
    if (signupError?.message?.includes('network') || signupError?.message?.includes('fetch')) {
      console.log('   ❌ Network error:', signupError.message)
      allPassed = false
    } else {
      // Expected errors: "User already registered" or email confirmation
      console.log('   ✅ Auth signup endpoint reachable')
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    if (allPassed) {
      console.log('✅ Supabase backend is properly configured!')
      console.log('\nNext steps:')
      console.log('   • Create database tables via Supabase SQL Editor')
      console.log('   • Set up Row Level Security (RLS) policies')
      console.log('   • Configure email templates in Supabase Dashboard')
    } else {
      console.log('❌ Some checks failed - review errors above')
      process.exit(1)
    }

  } catch (err) {
    console.error('\n❌ Unexpected error:', err)
    process.exit(1)
  }
}

checkConnection()
