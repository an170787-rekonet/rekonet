// Results Summary Band
// Calm, supportive overview of assessment results 
export default function ResultsSummaryBand({ 
  level = "Developing", 
  progressPercent = 0, 
  strengths = [], 
  nextStep = "Continue building confidence through short activities" 
}) { 
  return ( 
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: "12px", 
      padding: "16px", 
      marginBottom: "24px", 
      background: "#fafafa" 
    }}> 
      <h2>Your current level</h2> 
      <p style={{ fontSize: "18px", fontWeight: "bold" }}> 
        {level} 
      </p> 
      <p>You’re around {progressPercent}% of the way through this pathway.</p> 
      <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px" }}> 
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: "100%", 
            background: "#6366f1" 
          }} 
        /> 
      </div> 
      {strengths.length > 0 && ( 
        <> 
          <h3>What’s already working</h3> 
          <ul> 
            {strengths.map((s, i) => ( 
              <li key={i}>{s}</li> 
            ))} 
          </ul> 
        </> 
      )} 
      <p><strong>Suggested next step:</strong> {nextStep}</p> 
    </div> 
  ); 
}
``
