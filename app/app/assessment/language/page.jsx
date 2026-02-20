export default function LanguageSelection() {
  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
    { code: "ar", label: "Arabic" },
    { code: "pt", label: "Portuguese" },
    { code: "so", label: "Somali" },
    { code: "ur", label: "Urdu" }
  ];

  return (
    <main style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Select Your Preferred Language</h1>
      <p>This helps us show support text under English instructions.</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {languages.map((lang) => (
          <li key={lang.code} style={{ margin: "12px 0" }}>
            <button
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer"
              }}
              onClick={() => alert(`You selected ${lang.label}. Backend connection comes next.`)}
            >
              {lang.label}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
