# PhishTrace

PhishTrace is a full-stack phishing email investigation and incident response platform designed to simulate a real-world Security Operations Center (SOC) investigation workflow.

The platform provides a structured workflow for investigating suspicious emails, analysing authentication results, extracting indicators of compromise, performing threat intelligence analysis, generating security findings, assessing risk, investigating affected users, performing containment actions, mapping findings to MITRE ATT&CK techniques, correlating phishing campaigns, tracking investigation activity, and generating incident reports.

---

## Project Goal

The goal of PhishTrace is to simulate how a SOC analyst can investigate and respond to a phishing incident from initial email triage through investigation, risk assessment, containment, and incident reporting.

The platform brings multiple investigation stages together into a single interface so that evidence can be correlated throughout the incident lifecycle.

---

## Investigation Workflow

The PhishTrace investigation workflow follows these stages:

1. Create and manage an investigation case
2. Triage the reported phishing email
3. Analyse email headers and authentication
4. Extract URLs, domains, IP addresses and file hashes
5. Analyse extracted indicators using threat intelligence
6. Generate security findings
7. Assess the overall case risk
8. Identify affected users
9. Perform and track containment actions
10. Map findings to MITRE ATT&CK
11. Correlate related phishing campaign activity
12. Review the investigation timeline
13. Generate and review the incident investigation report
14. Review the complete case investigation summary

---

# Key Features

## 🔐 Authentication

- Analyst login system
- User registration
- Password hashing
- Session-based authentication
- Protected API endpoints
- Active/inactive user validation
- Logout functionality
- Authentication persistence across page refreshes

---

## 📁 Case Management

- Create investigation cases
- View all investigation cases
- View individual case details
- Update case information
- Track case severity
- Track investigation status
- Close completed cases

---

## 📧 Email Investigation

- Associate emails with investigation cases
- Store sender and recipient information
- Store subject and email metadata
- Store return-path and reply-to information
- Store raw email content
- View individual email investigations

---

## 🛡️ Email Authentication Analysis

The platform supports analysis of:

- SPF
- DKIM
- DMARC
- DMARC alignment
- Sender domains
- Return-path domains
- DKIM domains
- Authentication verdicts
- Analyst analysis notes

Authentication failures can be converted into security findings.

---

## 🔎 Indicator Extraction

PhishTrace automatically extracts indicators from email content, including:

- URLs
- IP addresses
- Domains
- MD5 hashes
- SHA-1 hashes
- SHA-256 hashes

Extracted indicators are stored and associated with the original email.

---

## 🌐 Threat Intelligence

PhishTrace includes a local threat-intelligence analysis engine that evaluates indicators and produces:

- Verdict
- Risk score
- Confidence level
- Analysis reason
- Provider information
- Investigation notes

The current implementation uses a local provider and is structured so that external threat-intelligence providers can be integrated in future versions.

---

## 🚨 Security Findings

Findings can be generated from investigation evidence such as:

- SPF failures
- DKIM failures
- DMARC failures
- Malicious indicators

Each finding can contain:

- Finding type
- Title
- Description
- Severity
- Confidence
- Evidence
- Analyst notes
- Case association

---

## ⚠️ Risk Assessment

PhishTrace calculates a case risk score based on finding severity.

Severity weighting:

| Severity | Score |
|----------|------:|
| Critical | 40 |
| High | 25 |
| Medium | 15 |
| Low | 5 |

The total score is capped at 100.

Risk levels are classified as:

| Score | Risk Level |
|------:|------------|
| 0–29 | Low |
| 30–59 | Medium |
| 60–79 | High |
| 80–100 | Critical |

---

## 👥 Affected Users

The platform allows analysts to track users affected by a phishing campaign.

Tracked information includes:

- User email
- Display name
- Department
- Whether the email was received
- Whether a link was clicked
- Whether credentials were submitted
- Whether the account was compromised
- Impact status
- Investigation notes

---

## 🛡️ Containment Actions

Analysts can create and track response actions such as:

- Disable User Account
- Block Malicious Domain
- Block Sender
- Quarantine Email
- Reset Password
- Isolate Endpoint
- Remove Email
- Other response actions

Each action can have a status:

- Pending
- In Progress
- Completed
- Failed

Containment actions can also record the target, analyst, notes and completion time.

---

## 🎯 MITRE ATT&CK

Security findings can be mapped to MITRE ATT&CK techniques.

MITRE mappings can include:

- Technique ID
- Technique name
- Tactic
- Description
- Evidence
- Associated finding

This allows analysts to connect investigation findings with adversary behaviour and attack techniques.

---

## 🔗 Campaign Correlation

PhishTrace can help identify relationships between investigation data and phishing campaign activity.

Campaign correlation helps analysts review related investigation information and identify patterns across phishing incidents.

This can support the identification of:

- Related phishing activity
- Similar indicators
- Connected investigation evidence
- Potential campaign patterns

---

## 🕒 Investigation Timeline

PhishTrace provides a chronological investigation timeline that helps analysts track important events throughout the case lifecycle.

The timeline provides a clear view of investigation progress and can help analysts understand how the incident developed.

Timeline information can include:

- Case activity
- Email investigation events
- Security findings
- Threat intelligence activity
- Containment actions
- Investigation progress
- Important security events

---

## 📄 Incident Investigation Report

PhishTrace provides a structured incident investigation report that brings together important evidence and security analysis from a case.

The report includes an executive summary and consolidated investigation information.

Report information can include:

- Case information
- Executive summary
- Risk assessment
- Investigation statistics
- Emails
- Indicators
- Threat intelligence results
- Security findings
- Affected users
- Containment actions
- MITRE ATT&CK mappings

This provides a consolidated view of the phishing incident investigation and response process.

---

## 📊 Case Summary

The case summary brings the investigation together and provides information about:

- Case details
- Emails
- Indicators
- Threat intelligence results
- Findings
- Affected users
- Containment actions
- MITRE ATT&CK mappings

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

## Backend

- Python
- Flask
- SQLAlchemy
- Flask session-based authentication

## Database

- Relational database using SQLAlchemy ORM

## Security

- Werkzeug password hashing
- Session-based authentication
- Protected API endpoints
- Input validation
- Authentication and authorization checks

## Development Tools

- Git
- GitHub
- Visual Studio Code

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │      Analyst        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      + Vite         │
                    └──────────┬──────────┘
                               │
                         HTTP / API
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Flask Backend    │
                    │                     │
                    │ Authentication      │
                    │ Case Management     │
                    │ Email Analysis      │
                    │ Indicator Extraction│
                    │ Threat Intelligence │
                    │ Findings            │
                    │ Risk Assessment     │
                    │ Affected Users      │
                    │ Containment         │
                    │ MITRE ATT&CK        │
                    │ Campaign Correlation│
                    │ Investigation       │
                    │ Timeline            │
                    │ Incident Reporting  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Database        │
                    │   SQLAlchemy ORM    │
                    └─────────────────────┘
```

---

## Screenshots

### Analyst Login

![PhishTrace Login](screenshots/login.png)

### SOC Dashboard

![PhishTrace Dashboard](screenshots/dashboard.png)

### Case Management

![PhishTrace Cases](screenshots/cases-1.png)

### Case Summary

![PhishTrace Case Summary](screenshots/case-summary.png)

### Email Investigation

![PhishTrace Emails](screenshots/emails.png)

### Security Findings

![PhishTrace Findings](screenshots/findings.png)

### Threat Intelligence

![PhishTrace Threat Intelligence](screenshots/threat-intelligence-3.png)

### Containment Actions

![PhishTrace Containment](screenshots/containment-actions.png)

### MITRE ATT&CK

![PhishTrace MITRE ATT&CK](screenshots/mitre-attack-1.png)

---

# Getting Started

## Prerequisites

To run PhishTrace locally, install:

- Python
- Node.js
- npm
- A supported relational database

## Clone the Repository

```bash
git clone <repository-url>
cd PhishTrace
```

## Backend Setup

Navigate to the backend directory and install the required Python dependencies.

```bash
cd backend
pip install -r requirements.txt
```

Configure the required environment variables before starting the backend.

Example environment variables:

```text
FLASK_SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
```

Start the backend using the project's configured Flask entry point.

## Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local development URL for accessing the application.

---

# Future Enhancements

Possible future improvements include:

- Integration with external threat-intelligence APIs
- Automated phishing email parsing
- Advanced indicator enrichment
- Email attachment analysis
- Malware sandbox integration
- SIEM integration
- Role-based access control
- Automated incident report export
- Advanced campaign analytics
- Production deployment configuration

---

# Project Status

## PhishTrace v1.0

The core investigation and incident response functionality is complete.

The project currently provides an end-to-end phishing investigation workflow covering email analysis, indicator extraction, threat intelligence, security findings, risk assessment, affected-user tracking, containment actions, MITRE ATT&CK mapping, campaign correlation, investigation timelines, case summaries, and incident reporting.

Future features can be developed as enhancements to the core platform.