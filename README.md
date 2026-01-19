# 🛡️ ADhuntX

**ADhuntX** is a fully integrated Active Directory Security Dashboard that combines **Privilege Risk Analysis** and **Password Hygiene Monitoring** into a single, offline system. It empowers internal IT, Cybersecurity and Audit teams to visualize user account risks based on group memberships, privilege escalation paths, and authentication security posture 100% offline.

![FootprintX Hero Screenshot](https://github.com/SuperMag99/ADhuntX/blob/main/screenshots/1.png)
![FootprintX Hero Screenshot](https://github.com/SuperMag99/ADhuntX/blob/main/screenshots/2.png)

## 🚀 Features

- **100% Offline Operation:** Runs entirely on the user's machine (localhost). No API calls, internet connection, or external services required.
- **Privilege Risk Analyzer:** Detects excessive privileges, shadow admins, and nested group escalation paths.
- **Password Hygiene Dashboard:** Identifies weak/expired passwords, accounts with "Password Never Expires", and dormant users.
- **Combined Risk Scoring:** Calculates a weighted "Total Risk Score" (0-100) per user, prioritizing remediation efforts.
- **Visual Analytics:** Interactive heatmaps, risk matrices, and trend charts for executive reporting.
- **Actionable Reporting:** filters high-risk accounts and exports detailed CSV reports for remediation.

## ▶️ Run Locally

### 1. Prerequisites
- **Node.js**: Version 18.x or higher.
- **npm**: Version 9.x or higher.
- **Modern Browser**: Chrome, Firefox, or Edge.

### 2. Setup
```Open CMD
# Clone the repository
git clone https://github.com/SuperMag99/ADhuntX.git

# Navigate to the project directory
cd ADhuntX

# Install dependencies
npm install

# Start the application
npm run dev
```

## 🧪 Data Privacy & Usage

- **Local Processing:** All CSV parsing and logic execution happen within the browser's memory. No data is uploaded to any server.
- **Input Data:** Requires CSV exports from Active Directory (via PowerShell or ADUC).
- **Sanitization:** While the tool is offline, ensure you handle your AD exports according to your organization's data handling policies.

## 📦 Repository Hygiene

- Sample data provided is fictitious.
- No real AD dumps are stored in this repository.

## 🧠 Intellectual Property Notice

All trademarks, platform names (e.g., Active Directory, Windows), and service names are the property of their respective owners. Their use is for identification and educational purposes only.

## 📄 Disclaimer

This project is provided "as is" without warranty. The authors are not responsible for misuse or damages. Intended for defensive cybersecurity purposes only.

## 📌 Project Status
🚧 **Active Development**  
Features and detection logic evolve as threat landscapes change.

## 🧭 Security and Vulnerabilities

- **Security:** Refer to [SECURITY.md](./SECURITY.md).

## ⭐ Support the Project
If this project helps your team, consider giving it a ⭐.

## 📄 License
MIT License

Copyright (c) 2026 ADhuntX

## 👤 Maintainer
- **🔗 GitHub:** [SuperMag99](https://github.com/SuperMag99)
- **🔗 LinkedIn:** [mag99](https://www.linkedin.com/in/mag99/)
