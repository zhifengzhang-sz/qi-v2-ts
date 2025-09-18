# System Overview

## Architecture Philosophy

qi-v2-ts implements a **local-first, agent-driven research framework** that combines the power of modern AI agents with specialized domain tools for time series research.

## Core Principles

1. **Local Execution** - All processing happens locally (no API costs, full privacy)
2. **Agent-Driven** - Claude Code orchestrates complex research workflows
3. **Modular Design** - Specialized MCP servers for different research domains
4. **Research-Focused** - Purpose-built for time series segmentation research

## High-Level Architecture

```mermaid
graph TB
    subgraph "Research Orchestration"
        U[Researcher] --> CC[Claude Code]
        CC --> CCM[Claude Models via API]
    end

    subgraph "MCP Protocol Boundary"
        CC --> MCP[MCP Tool Calls]
        MCP --> RESP[MCP Responses]
        RESP --> CC
    end

    subgraph "Independent MCP Servers"
        subgraph "Research Server Process"
            MCP --> DRA_MCP[Deep Research Agent MCP]
            DRA_MCP --> DRA[DeepResearchAgent]
            DRA --> LOCAL_OL[Local Ollama]
            LOCAL_OL --> QW[Qwen2.5 Models]
            DRA --> WS[Web Search]
            DRA_MCP --> RESP
        end

        subgraph "TS Analysis Server Process"
            MCP --> TSA_MCP[TS Analysis MCP]
            TSA_MCP --> TSA[TS Analysis Engine]
            TSA --> NPY[NumPy/SciPy]
            TSA --> LOCAL_OL
            TSA_MCP --> RESP
        end

        subgraph "FSM Server Process"
            MCP --> FSM_MCP[FSM MCP Server]
            FSM_MCP --> FSM[FSM Engine]
            FSM --> PT[PyTorch]
            FSM --> LOCAL_OL
            FSM_MCP --> RESP
        end

        subgraph "Segmentation Server Process"
            MCP --> SEG_MCP[Segmentation MCP]
            SEG_MCP --> SEG[Segmentation Engine]
            SEG --> RUP[ruptures/tslearn]
            SEG --> LOCAL_OL
            SEG_MCP --> RESP
        end
    end

    subgraph "Local Data & Storage"
        TSA --> DS[Datasets]
        FSM --> MD[Models]
        SEG --> RS[Results]
        DRA --> LIT[Literature Cache]
    end

    style CC fill:#e1f5fe
    style MCP fill:#f3e5f5
    style LOCAL_OL fill:#e8f5e8
    style DRA fill:#fff3e0
    style RESP fill:#e8f5e8
```

## Component Responsibilities

### Claude Code Agent (Anthropic Models)
- **Role**: Master orchestrator and workflow coordinator
- **LLM**: Uses Anthropic's Claude models via API
- **Capabilities**:
  - High-level task planning and decomposition
  - MCP tool coordination and sequencing
  - Result synthesis and report generation
  - User interaction and decision making
- **Limitation**: Does NOT process research content directly - delegates to MCP servers

### MCP Protocol Layer
- **Role**: Clean separation between orchestration and processing
- **Function**: Standardized tool interface for Claude Code
- **Communication**: JSON-RPC over stdio (text in/text out)
- **Benefits**:
  - Complete process isolation
  - Independent server lifecycle management
  - Type-safe tool definitions

### Independent MCP Servers (Local Processing)
- **Role**: Heavy computational and research work
- **LLM**: Each server has its own local Ollama + Qwen2.5 connection
- **Architecture**: Completely independent Python processes
- **Models Available**:
  - `qwen2.5:7b` - General research and analysis
  - `qwen2.5:14b` - Complex reasoning and synthesis
- **Benefits**:
  - No API costs for research processing
  - Full privacy (data never leaves local machine)
  - Offline operation capability
  - Specialized domain expertise per server

### Deep Research Agent
- **Role**: Comprehensive literature research
- **Capabilities**:
  - Multi-step research planning
  - Web search and citation analysis
  - Academic paper synthesis
  - Trend identification

### Specialized MCP Servers
- **Time Series Analysis**: Data loading, preprocessing, visualization
- **Finite State Models**: Multi-scale FSM implementation and training
- **Segmentation**: Change point detection and boundary optimization

## Research Workflow Integration

```mermaid
sequenceDiagram
    participant R as Researcher
    participant CC as Claude Code (Anthropic)
    participant DRA_MCP as Deep Research Agent MCP
    participant DRA as DeepResearchAgent + Local Ollama
    participant TSA_MCP as TS Analysis MCP
    participant TSA as TS Engine + Local Ollama
    participant FSM_MCP as FSM MCP
    participant FSM as FSM Engine + Local Ollama

    Note over R,FSM: Claude Code orchestrates, MCP servers do heavy lifting

    R->>CC: "Research multi-scale FSM for TS segmentation"

    Note over CC,DRA: Literature Review (Independent Process)
    CC->>DRA_MCP: time_series_literature_review("segmentation")
    DRA_MCP->>DRA: Execute research with local Ollama
    DRA->>DRA: Multi-step research + web search + synthesis
    DRA-->>DRA_MCP: Comprehensive literature report
    DRA_MCP-->>CC: Text report (no direct Ollama access)

    Note over CC,TSA: Data Preparation (Independent Process)
    CC->>TSA_MCP: load_dataset("benchmark_ts_data")
    TSA_MCP->>TSA: Load and validate data
    TSA-->>TSA_MCP: Dataset metadata
    TSA_MCP-->>CC: Dataset summary

    Note over CC,FSM: Model Development (Independent Process)
    CC->>FSM_MCP: create_multi_scale_fsm(specifications)
    FSM_MCP->>FSM: Generate architecture using local Ollama
    FSM->>FSM: Implement and train model
    FSM-->>FSM_MCP: Trained model results
    FSM_MCP-->>CC: Model performance summary

    Note over CC,R: Claude Code synthesizes all results
    CC->>R: Comprehensive research synthesis + next steps
```

## Key Benefits

1. **Hybrid Cost Model**:
   - Claude Code API costs only for orchestration
   - Unlimited local research processing with Ollama (zero cost)
   - Research-heavy workloads run locally

2. **Privacy & Security**:
   - Research data never leaves local machine
   - Sensitive time series data processed locally
   - Only high-level orchestration goes through API

3. **Best of Both Worlds**:
   - Claude Code's superior planning and orchestration
   - Local LLM power for compute-intensive research tasks
   - Clean separation of concerns

4. **Scalability**:
   - MCP servers can be upgraded independently
   - Add new research domains without changing Claude Code
   - Local processing scales with hardware

5. **Reproducibility**:
   - Deterministic local LLM environment
   - Version-controlled MCP server implementations
   - Consistent research methodology

6. **Domain Specialization**:
   - Each MCP server optimized for specific research tasks
   - Custom prompts and workflows per domain
   - Specialized model fine-tuning capability