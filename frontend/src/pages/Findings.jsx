function Findings() {
  const findings = [
    {
      title: "Malicious Indicator",
      description:
        "Domain uses a suspicious lookalike pattern associated with phishing.",
      severity: "CRITICAL",
      type: "Threat Intelligence",
    },
    {
      title: "DMARC Authentication Failure",
      description:
        "DMARC authentication failed for this email.",
      severity: "HIGH",
      type: "Email Authentication",
    },
    {
      title: "DKIM Authentication Failure",
      description:
        "DKIM authentication failed during email analysis.",
      severity: "HIGH",
      type: "Email Authentication",
    },
    {
      title: "Phishing Lookalike Domain",
      description:
        "The phishing email used a suspicious lookalike domain to impersonate a legitimate Microsoft service.",
      severity: "HIGH",
      type: "Phishing",
    },
  ];

  return (
    <div className="page">

      <div className="topbar">

        <div>
          <h2>Findings</h2>

          <p>
            Security findings identified during investigation
          </p>
        </div>

        <div className="case-badge">
          4 FINDINGS
        </div>

      </div>

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Investigation Findings
            </h3>

            <small>
              Case PH-2026-0001
            </small>
          </div>

          <span>
            4 identified
          </span>

        </div>

        <div className="findings-list">

          {findings.map((finding, index) => (

            <div
              className="finding"
              key={index}
            >

              <div className="finding-indicator">
                !
              </div>

              <div className="finding-content">

                <h5>
                  {finding.title}
                </h5>

                <p>
                  {finding.description}
                </p>

                <div className="finding-tags">

                  <span className="tag severity-tag">
                    {finding.severity}
                  </span>

                  <span className="tag">
                    {finding.type}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Findings;