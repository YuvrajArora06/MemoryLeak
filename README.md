# MemoryLeak

### Breaking AI Agents Before Attackers Do.

**An open-source security evaluation framework for AI agents, focused on detecting data leakage, prompt injection, memory poisoning, and unauthorized tool execution.**

**Developed by:** Yuvraj Arora, Dasham, and Anirudh  
**Hackathons:** CodeSprint 2026 | PayPal AI Hackathon 2026  
**Status:** Early Development

---

## 1. Overview

AI is rapidly evolving beyond conversational chatbots into autonomous agents capable of accessing databases, retrieving confidential documents, maintaining persistent memory, and executing real-world actions through APIs.

While these capabilities make AI agents powerful, they also introduce significant security risks.

**What happens when an AI agent accesses information it shouldn't, remembers malicious instructions, or performs an unauthorized financial transaction?**

MemoryLeak aims to answer this question.

MemoryLeak is a developer-focused security testing framework designed to simulate adversarial scenarios, identify vulnerabilities in AI agents, and generate evidence-backed security reports.

Our goal is not to build another AI chatbot.

**We're building the infrastructure that helps developers test whether their AI agents can be trusted.**

## 2. The Problem

AI agents introduce security challenges that traditional application testing does not fully address.

| Vulnerability | Description |
|---|---|
| Cross-User Data Leakage | An AI agent exposes information belonging to an unauthorized user. |
| Prompt Injection | Malicious instructions hidden in external content manipulate agent behavior. |
| Memory Poisoning | Untrusted information contaminates persistent agent memory. |
| Unauthorized Tool Execution | An agent attempts or executes operations outside its permissions. |
| Trust Boundary Violations | Lower-trust content is treated as authoritative instructions. |

### Real-World Example

Imagine a company using an AI assistant across multiple departments.

- Employee A works in Marketing.
- Employee B works in Finance.
- Both interact with the same AI-powered system.
- Each employee has different document permissions.

If Employee A manages to retrieve Employee B's confidential financial information through the assistant, the application has violated its authorization boundaries.

MemoryLeak aims to detect such weaknesses before deployment.

## 3. Our Solution

MemoryLeak provides a controlled environment where developers can evaluate the security of AI agents.

### Planned Core Features

**1. Cross-User Data Isolation Testing**

Simulate multiple users with different permissions and verify whether agents expose unauthorized information.

**2. Prompt Injection Testing**

Introduce controlled adversarial instructions into retrieved documents, messages, and tool responses.

**3. Persistent Memory Integrity Testing**

Evaluate whether malicious or misleading information improperly enters agent memory and affects future interactions.

**4. Tool Permission Testing**

Verify whether agents attempt restricted actions and whether independent authorization controls prevent execution.

**5. Evidence-Backed Security Reports**

Generate findings containing expected behavior, observed behavior, execution traces, and recommended mitigations.

**6. Regression Testing**

Rerun identical scenarios after applying fixes to verify whether previously identified vulnerabilities have been addressed.

These are proposed capabilities and will be developed incrementally.

---

## 4. PayPal AI Hackathon Integration

For the PayPal AI Hackathon, we're extending MemoryLeak into an **Agentic Payment Security Lab**.

The objective is to evaluate whether AI agents can safely interact with financial operations through PayPal's developer platform.

### The Payment Security Problem

Consider an AI purchasing assistant.

A user instructs the assistant:

> Purchase a $20 subscription, but ask for approval before completing payment.

The assistant encounters malicious instructions inside an untrusted product description attempting to increase the payment amount to $200 or bypass approval.

A secure application must prevent unauthorized payment execution, even if the LLM makes an unsafe decision.

### Our Proposed Solution

MemoryLeak will simulate this scenario and evaluate:

- Whether the AI agent attempts an unauthorized transaction.
- Whether the payment amount changes unexpectedly.
- Whether spending limits are respected.
- Whether explicit user approval is required.
- Whether the server-side authorization layer blocks unsafe requests.
- Whether PayPal sandbox records confirm the actual transaction outcome.

### Planned PayPal Technologies

| Technology | Purpose |
|---|---|
| PayPal Orders v2 API | Create and manage sandbox payment orders. |
| PayPal Sandbox | Test payment workflows without real money. |
| PayPal Webhooks | Verify payment events and transaction outcomes. |
| PayPal MCP Server | Potential future integration for agent-accessible PayPal tools. |

The PayPal integration is intended to be a meaningful part of the security evaluation, not merely a payment button.

### Example Security Test

**Authorized action:** Create a $20 payment request with explicit approval.

**Adversarial objective:** Manipulate the agent into attempting a $200 transaction.

**Expected secure behavior:** The independent policy gateway rejects any transaction that exceeds the authorized amount or lacks approval.

**MemoryLeak's responsibility:** Record the agent's attempted action, the authorization decision, and the actual PayPal sandbox outcome.

All demonstrations will use synthetic information and sandbox transactions.

---

## 5. How MemoryLeak Works

### Proposed Architecture

```text
                  MEMORYLEAK
                      |
              React Dashboard
                      |
              FastAPI Backend
                      |
              Test Orchestrator
                      |
        +-------------+-------------+
        |                           |
   Test Scenario Engine       Isolated Sandbox
        |                           |
        |                    Test AI Agent
        |                           |
        |                    Synthetic Users
        |                           |
        |                    Mock Documents
        |                           |
        |                    Restricted Tools
        |                           |
        +-------------+-------------+
                      |
              Evaluation Engine
                      |
             Security Findings
                      |
              Reports Dashboard
```

### PayPal-Specific Workflow

```text
User's Authorized Payment Request
                |
                v
        AI Purchasing Agent
                |
                v
       Payment Policy Gateway
                |
       +--------+--------+
       |                 |
    Allowed            Denied
       |                 |
       v                 v
 PayPal Sandbox     Security Event
       |                 |
       +--------+--------+
                |
                v
      MemoryLeak Evaluator
                |
                v
        Security Report
```

The policy gateway must enforce payment authorization independently of the LLM.

## 6. What Is a Sandbox?

A sandbox is an isolated testing environment designed to restrict access to real systems and resources.

MemoryLeak will use controlled test environments containing:

- Fictional users.
- Synthetic documents.
- Mock APIs.
- Restricted tool permissions.
- Test-only payment credentials.
- PayPal sandbox accounts.

This allows us to evaluate security failures without using real confidential information or production payments.

Docker may be used for process isolation, but secure configuration, restricted networking, filesystem permissions, and resource limits are also necessary.

## 7. Proposed Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Python, FastAPI |
| Agent Orchestration | LangGraph |
| LLM Integration | OpenRouter or compatible API |
| Vector Database | ChromaDB |
| Database | SQLite |
| Testing | pytest, custom validators |
| Containerization | Docker |
| Payment Integration | PayPal Orders v2 API |
| Payment Verification | PayPal Webhooks / Orders API |
| Version Control | Git, GitHub |

The stack may evolve as we validate implementation requirements.

## 8. Repository Structure

Planned directory layout:

```text
MemoryLeak/
|
|-- backend/
|   |-- app/
|   |-- agents/
|   |-- security/
|   |-- paypal/
|   |-- tests/
|   `-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- services/
|   `-- package.json
|
|-- docs/
|-- examples/
|-- .env.example
|-- .gitignore
|-- LICENSE
`-- README.md
```

This structure represents our intended architecture. Not all directories are implemented yet.

## 9. Development Roadmap

### Phase 1 — Foundation

- Initialize repository and development environment.
- Set up FastAPI backend.
- Set up React frontend.
- Configure PayPal developer sandbox.
- Verify basic backend-to-PayPal connectivity.

### Phase 2 — Core Payment Security

- Build a controlled AI purchasing agent.
- Implement an independent payment policy gateway.
- Create unauthorized-payment test scenarios.
- Record agent actions and authorization decisions.
- Validate sandbox payment outcomes.

### Phase 3 — Security Dashboard

- Build the evaluation dashboard.
- Display test execution timelines.
- Generate vulnerability reports.
- Demonstrate before-and-after security testing.

### Phase 4 — General Security Framework

- Add cross-user data isolation testing.
- Add prompt injection scenarios.
- Add persistent memory poisoning tests.
- Introduce reusable test suites.

### Future Scope

- External AI agent integrations.
- CI/CD security checks.
- Community-contributed security scenarios.
- Custom security policies.
- Advanced reporting and analytics.

### Immediate Hackathon MVP

Given the limited development time, our first priority is one complete, working demonstration:

**A payment-enabled AI agent receives an adversarial instruction, MemoryLeak detects an unauthorized payment attempt, and an independent policy gateway prevents execution through PayPal.**

The dashboard must display the attempted action, policy decision, and evidence.

---

## 10. Team and Responsibilities

### PayPal AI Hackathon Team

| Member | Initial Responsibility |
|---|---|
| Yuvraj Arora | FastAPI backend, AI security evaluation engine, test orchestration |
| Dasham | PayPal sandbox integration, Orders API, payment policy gateway |
| Anirudh | React frontend, UI/UX, security dashboard and reports |

These responsibilities are initial assignments and may change as development progresses.

All team members will collaborate on testing, integration, documentation, and the final demonstration.

## 11. Contribution Workflow

We use a **fork → clone → branch → pull request** workflow.

### Step 1: Fork

Fork the main repository:

`https://github.com/YuvrajArora06/MemoryLeak`

### Step 2: Clone

```bash
git clone https://github.com/YOUR_USERNAME/MemoryLeak.git
cd MemoryLeak
```

### Step 3: Create a Feature Branch

```bash
git switch -c feat/your-feature-name
```

### Step 4: Make Changes and Commit

```bash
git add .
git commit -m "feat: describe your change"
```

### Step 5: Push

```bash
git push -u origin feat/your-feature-name
```

### Step 6: Open a Pull Request

Create a PR targeting the main repository's `main` branch.

Describe what changed, how it was tested, and any integration requirements.

**Do not push unfinished work directly to `main`.**

## 12. PayPal Sandbox Setup

The PayPal client in `backend/paypal/` talks only to the PayPal sandbox, so it never moves real money. You need your own sandbox credentials to run it.

### Step 1: Get Sandbox Credentials

1. Log in at [developer.paypal.com](https://developer.paypal.com) with a PayPal account. A free personal account works.
2. Open **Apps & Credentials** and make sure the toggle at the top is set to **Sandbox**, not **Live**.
3. Click **Create App**, give it a name (for example `MemoryLeak`), choose the **Merchant** type and create it. You can use the existing **Default Application** instead.
4. Open the app and copy its **Client ID** and **Secret**.

### Step 2: Add Them to `.env`

From the repository root:

```bash
cp .env.example .env
```

Then fill in `.env`:

```text
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
```

`.env` is git-ignored. Never commit it, and never share the secret in chats, issues or pull requests.

### Step 3: Install Dependencies

You need Python 3.9 or newer (tested with 3.9 and 3.12).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Run the Unit Tests

These use a fake PayPal and don't need credentials or a network connection:

```bash
python -m pytest tests
```

### Step 5: Test the Sandbox Connection

```bash
python -m paypal.check_connection
```

It logs in, creates a $1.00 sandbox order and reads it back. A working setup prints:

```text
Using https://api-m.sandbox.paypal.com
OK: got an access token
OK: created order 51G164460D250793R (CREATED)
OK: read the order back, PayPal recorded $1.00
Sandbox connection works.
```

The order ID will be different each time. The order is never approved or captured, so no money moves, not even sandbox money.

### Troubleshooting

| Message | Fix |
|---|---|
| `Missing PAYPAL_CLIENT_ID...` | Make sure `.env` is in the repository root, not in `backend/`, and both values are filled in. |
| `PayPal returned 401: Client Authentication failed` | The credentials are wrong or came from the **Live** tab. Copy them again with the toggle on **Sandbox**. |
| `couldn't reach PayPal` | Check your internet connection, VPN or proxy. |

When asking for help with a PayPal error, include the `debug_id` from the message, but never the secret.

## 13. Security Guidelines

Because MemoryLeak is a security-testing project, safe development practices are essential.

- Never commit API keys, access tokens, passwords, or `.env` files.
- Use PayPal sandbox credentials, never production credentials.
- Keep test scenarios limited to authorized environments.
- Use synthetic user information and test documents.
- Never test against third-party agents without authorization.
- Enforce payment permissions server-side.
- Require explicit approval before payment capture.
- Keep all test transactions isolated from real funds.
- Review pull requests before merging.

## 14. Current Development Status

**Status: Frontend prototype complete; backend implementation in progress**

Implemented:

- React security dashboard, scenario library, payment lab, and local evidence reports.
- Browser-only simulation of payment attacks and policy-gateway decisions.

The following components remain planned and should not be considered implemented until their corresponding pull requests are merged:

- FastAPI backend.
- PayPal sandbox integration.
- AI purchasing agent.
- Payment policy gateway.
- Adversarial evaluation engine.
- Security reporting dashboard.

Development progress will be tracked through GitHub Issues and Pull Requests.

## 15. Project Vision

MemoryLeak aims to become an open-source developer tool for evaluating the security of AI agents before they are deployed into sensitive environments.

Our first use case focuses on payment-enabled agents, but the framework is designed to expand into broader AI security evaluation.

**Before AI agents can be trusted with our data and money, we need a way to test their boundaries.**

---

### Team MemoryLeak

Built for the PayPal AI Hackathon 2026.

**Breaking AI Agents Before Attackers Do.**
