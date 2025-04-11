export default function DebugPage() {
  // Display environment variables for debugging
  // WARNING: Only use this in development, never in production!
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="bg-muted p-4 rounded-md">
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</p>
        <p>
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (value hidden)" : "Not set"}
        </p>
        <p>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || "Not set"}</p>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Troubleshooting</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Make sure all environment variables are set in your .env.local file</li>
          <li>Verify that the NEXT_PUBLIC_SUPABASE_URL is a valid URL (should start with https://)</li>
          <li>Check that your Supabase project is active</li>
          <li>Try restarting your development server</li>
        </ul>
      </div>
    </div>
  )
}
