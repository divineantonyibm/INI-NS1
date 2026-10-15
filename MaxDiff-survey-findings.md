These capabilities are intended to be understandable to DNS practitioners who do not use NS1 today. The goal is to test which AI-assisted capabilities are most valuable, using vendor-neutral language and keeping each capability distinct.
1. Guide initial DNS setup
Guide you through getting started with a DNS platform, including explaining setup steps and helping configure core elements such as zones, DNS records, monitoring, and API access.

Survey wording:
Guide initial DNS setupHelp you set up and configure a new DNS platform for the first time.

2. Help build advanced traffic steering configurations
Help you design advanced traffic steering configurations by explaining available options and helping determine how traffic should be routed based on your intended outcome.

Survey Wording:
Build advanced traffic steering configurationsHelp you design how DNS traffic should be routed based on your goals.

3. Validate configurations before deployment
Review or simulate a proposed DNS configuration before it is deployed to identify potential problems and show how the configuration is expected to behave.

Survey Wording:
Validate configurations before deploymentReview or simulate DNS configurations to identify potential issues before changes go live.

4. Interpret DNS telemetry and troubleshoot issues
Analyze DNS telemetry, such as query volume, response codes, query logs, or traffic-steering results, to identify patterns, anomalies, and potential causes of problems.

Survey Wording:
Interpret DNS telemetry and troubleshoot issuesAnalyze DNS data to identify patterns, anomalies, and potential causes of problems.

5. Provide expert help during ongoing product use
Answer questions about how a DNS platform works and how to accomplish specific tasks when you need help during day-to-day use.

Survey wording:
Provide help during ongoing product useAnswer questions and guide you through tasks while using a DNS platform.

6. Plan and execute DNS changes
Create a proposed plan for DNS changes, allow you to review and approve it, and then make the approved changes on your behalf.

Survey wording:
Plan and execute DNS changesCreate a proposed DNS change, let you review and approve it, then execute the approved change.


AI explained
IBM Network Intelligence
Overview
Network Intelligence uses AI to monitor network metric and alarm data, detect observations, and automatically investigate root causes and generate remediation procedures.

Analytic component – Core AI capabilities
Network Intelligence uses a time-series foundation model to perform analysis for detecting network observations in metric and alarm data.

TSPulse foundation model
TSPulse is a time series foundation model that performs time-domain and frequency-domain analysis and identifies short-term and long-term patterns to generate observations in network data.

Automation component – AI agents
Network Intelligence is built on a unified agentic harness, which is the core AI reasoning engine that powers every automated and interactive feature on the platform. It receives a goal or question, applies reasoning to determine the correct steps, and uses available tools to generate a response. This cycle is repeated until the task is completed.

Agent decision-making process
The agent operates step by step, evaluating at each step whether to answer directly, look up information, query data, update a record, or delegate to a specialist. The agent repeats the process until the task is complete or human input is required.

Long-running task support
The agent manages its own memory automatically for complex investigations with many steps. It summarizes older exchanges and continues working from that summary, preserving the important context and tracking the investigation activities. The agents can handle complex investigations without limits or losing continuity.

Human in the loop approval
For certain tasks, the agent requires your approval before proceeding and pauses until you accept or reject the requested action. The agent resumes the task or takes an alternative approach based on your response.

Specialist subagents
The agent can delegate work to pre-built specialist agents designed for specific types of tasks. Each specialist agent handles its assigned work independently and returns the results to the main agent. This allows the agent to break the complex tasks into parallel or sequential workstreams and complete the tasks more efficiently and accurately.

Examples of specialized agents include:

Symptoms agent
The Symptoms Agent continuously monitors a network device and converts raw observations, such as metric anomalies, alarms, and syslog events, into structured symptom records. The symptom records are the standardized evidence used by the platform's correlation engine to detect, correlate, and classify network issues.

The agent gathers supporting evidence (such as device logs, metrics, alarms, and network topology) to identify the real signal from noise and record one or more symptoms. Each symptom includes key details such as severity, affected protocols, relevant counters, and connected neighboring devices, enabling the platform to correlate related issues across the network and identify broader root causes.

RAG agent
The RAG Agent is an on-demand subagent that answers questions using user-uploaded documentation in the Grounding documents page. If the user asks for a query in the chat, the agent retrieves the most relevant information from the uploaded documents and generates responses with the citations to the source documents for transparency and verification. The main assistant agent delegates to the RAG Agent when a query requires knowledge from uploaded documents, ensuring responses are grounded in relevant sources.

The RAG Agent uses a hybrid retrieval strategy that combines semantic search and keyword matching to identify relevant content from uploaded documentation. It can expand context around highly relevant document sections to improve response quality and completeness.

AI-powered experiences
The agent harness drives all AI-powered experiences across the platforms:

Interactive chat answers your questions in real time within the investigation context.
Autonomous analysis detects observations in the network data and generates investigation summaries automatically.
Symptom analysis evaluates observed symptoms against known patterns.
Network topology builds structured representations of network relationships and dependencies from investigation data.
Slack integration responds to queries raised directly in Slack.
Background workers process queued insights asynchronously.
Oversight and traceability
The agent activities are tracked in real time, including reasoning traces, event timeline, processed events, and root cause analysis (RCA) reasoning. This provides transparency and a clear audit trail for each automated decision.