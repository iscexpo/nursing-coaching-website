export default function NotFound() {
  return (
    <div style={{ display: 'flex', minHeight: '60vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404 — পৃষ্ঠা পাওয়া যায়নি</h1>
      <p style={{ marginTop: '0.5rem', color: '#666' }}>
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।
      </p>
    </div>
  )
}
