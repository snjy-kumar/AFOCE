import { createServerComponentClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerComponentClient()

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
