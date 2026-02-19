
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home(){
  const [ok,setOk]=useState<string>('checking...')
  useEffect(()=>{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKeys = !!url && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setOk(hasKeys?`Connected to ${url}`:'Missing Supabase env vars')
  },[])
  return (
    <>
      <Head>
        <title>Rekonet</title>
      </Head>
      <main style={{fontFamily:'system-ui,Segoe UI,Roboto,Helvetica,Arial',padding:24}}>
        <h1>Rekonet — Preview</h1>
        <p>Status: <strong>{ok}</strong></p>
        <p>This is a minimal starter deployed on Vercel. Once live, we will add modules, interview simulator, badges, and admin dashboards.</p>
      </main>
    </>
  )
}
