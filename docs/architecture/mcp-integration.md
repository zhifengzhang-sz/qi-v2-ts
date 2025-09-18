# MCP Integration Architecture

## Model Context Protocol (MCP) Overview

MCP provides a standardized way for Claude Code to integrate with specialized tools and services. **Critically**: Claude Code only sends tool requests and receives text responses - it does NOT directly access or control the local LLMs within MCP servers.

In qi-v2-ts, each MCP server is a completely independent process that:
- Runs its own local Ollama connection
- Performs heavy research/computation internally
- Returns processed results as text to Claude Code
- Operates with full privacy (no data sharing with Claude Code)

## MCP Server Architecture

```mermaid
graph TB
    subgraph "Claude Code Process"
        CC[Claude Code Agent]
        CAI[Claude API]
        CC --> CAI
    end

    subgraph "MCP Protocol Boundary"
        CC --> TOOL_REQ[MCP Tool Requests]
        TOOL_RESP[MCP Tool Responses] --> CC

        note1[("Text Only Communication<br/>No Direct LLM Access")]
    end

    subgraph "Independent Server Process 1"
        TOOL_REQ --> DRA_MCP[Deep Research Agent MCP]
        DRA_MCP --> DRA_SVC[DRA Service Logic]
        DRA_SVC --> DRA_AGENT[DeepResearchAgent]
        DRA_SVC --> OL1[Local Ollama Instance]
        OL1 --> QW1[Qwen2.5 Models]
        DRA_AGENT --> WEB[Web Search APIs]
        DRA_SVC --> TOOL_RESP
    end

    subgraph "Independent Server Process 2"
        TOOL_REQ --> TSA_MCP[TS Analysis MCP]
        TSA_MCP --> TSA_SVC[TS Analysis Service]
        TSA_SVC --> OL2[Local Ollama Instance]
        TSA_SVC --> NP[NumPy/SciPy/Pandas]
        OL2 --> QW2[Qwen2.5 Models]
        TSA_SVC --> TOOL_RESP
    end

    subgraph "Independent Server Process 3"
        TOOL_REQ --> FSM_MCP[FSM MCP Server]
        FSM_MCP --> FSM_SVC[FSM Service Logic]
        FSM_SVC --> OL3[Local Ollama Instance]
        FSM_SVC --> PT[PyTorch/scikit-learn]
        OL3 --> QW3[Qwen2.5 Models]
        FSM_SVC --> TOOL_RESP
    end

    subgraph "Independent Server Process 4"
        TOOL_REQ --> SEG_MCP[Segmentation MCP]
        SEG_MCP --> SEG_SVC[Segmentation Service]
        SEG_SVC --> OL4[Local Ollama Instance]
        SEG_SVC --> RUP[ruptures/tslearn]
        OL4 --> QW4[Qwen2.5 Models]
        SEG_SVC --> TOOL_RESP
    end

    style CC fill:#e1f5fe
    style CAI fill:#ffebee
    style note1 fill:#fff3e0
    style OL1 fill:#e8f5e8
    style OL2 fill:#e8f5e8
    style OL3 fill:#e8f5e8
    style OL4 fill:#e8f5e8
```

## Server Configurations

### 1. Deep Research Agent Server

```json
{
  "name": "deep-research-agent",
  "command": "python",
  "args": ["servers/deep-research-agent/src/deep_research_agent/mcp_server.py"],
  "env": {
    "DEEP_RESEARCH_AGENT_PATH": "/home/zzhang/dev/qi/github/qi-v2-ts/research/DeepResearchAgent",
    "OLLAMA_URL": "http://localhost:11434"
  }
}
```

**Key Features:**
- **Independent Process**: Runs completely separately from Claude Code
- **Local LLM**: Has its own dedicated Ollama connection
- **Privacy**: Research data never shared with Claude Code
- **Tools Provided:**
  - `deep_research` - General research queries
  - `time_series_literature_review` - Specialized TS literature reviews
  - `research_finite_state_models` - FSM-specific research

### 2. Time Series Analysis Server

```json
{
  "name": "ts-analysis",
  "command": "python",
  "args": ["servers/ts-analysis/src/mcp_server.py"],
  "env": {
    "OLLAMA_URL": "http://localhost:11434"
  }
}
```

**Key Features:**
- **Independent Process**: Own Python environment and Ollama connection
- **Local Processing**: All time series data stays local
- **Tools Provided:**
  - `load_dataset` - Load time series datasets
  - `preprocess_ts` - Data preprocessing with local LLM assistance
  - `visualize_ts` - Time series visualization
  - `statistical_analysis` - Statistical measures and analysis

### 3. Finite State Models Server

```json
{
  "name": "finite-state-models",
  "command": "python",
  "args": ["servers/finite-state-models/src/mcp_server.py"],
  "env": {
    "OLLAMA_URL": "http://localhost:11434"
  }
}
```

**Key Features:**
- **Independent Process**: Dedicated to FSM research and implementation
- **Local LLM Integration**: Uses Qwen2.5 for code generation and optimization
- **Tools Provided:**
  - `create_multi_scale_fsm` - Create FSM architecture with local LLM assistance
  - `train_fsm` - Model training with intelligent hyperparameter tuning
  - `analyze_fsm_performance` - Performance analysis and visualization
  - `state_inference` - State sequence inference and interpretation

### 4. Segmentation Server

```json
{
  "name": "segmentation",
  "command": "python",
  "args": ["servers/segmentation/src/mcp_server.py"],
  "env": {
    "OLLAMA_URL": "http://localhost:11434"
  }
}
```

**Key Features:**
- **Independent Process**: Specialized for time series segmentation
- **Algorithm Intelligence**: Local LLM assists with algorithm selection and tuning
- **Tools Provided:**
  - `change_point_detection` - Intelligent change point detection
  - `segment_time_series` - Multi-algorithm segmentation with optimization
  - `evaluate_segmentation` - Comprehensive performance evaluation
  - `optimize_boundaries` - LLM-assisted boundary refinement

## Communication Flow

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant MP as MCP Client
    participant MS as MCP Server
    participant SV as Service Logic
    participant EX as External Tools

    CC->>MP: Call tool with parameters
    MP->>MS: MCP tool request
    MS->>SV: Parse and validate
    SV->>EX: Execute with external tools
    EX-->>SV: Results
    SV-->>MS: Formatted response
    MS-->>MP: MCP response
    MP-->>CC: Tool results

    Note over CC,EX: All communication via JSON-RPC over stdio
```

## Error Handling

```mermaid
graph TB
    TR[Tool Request] --> VAL[Parameter Validation]
    VAL -->|Valid| EXEC[Execute Tool]
    VAL -->|Invalid| ERR1[Validation Error]

    EXEC --> CALL[Call External Service]
    CALL -->|Success| RES[Return Results]
    CALL -->|Timeout| ERR2[Timeout Error]
    CALL -->|Exception| ERR3[Execution Error]

    ERR1 --> FMT[Format Error Response]
    ERR2 --> FMT
    ERR3 --> FMT
    RES --> FMT
    FMT --> RESP[MCP Response]

    style ERR1 fill:#ffebee
    style ERR2 fill:#ffebee
    style ERR3 fill:#ffebee
    style RES fill:#e8f5e8
```

## Server Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initialize
    Initialize --> Ready
    Ready --> Processing: Tool Request
    Processing --> Ready: Response Sent
    Processing --> Error: Exception
    Error --> Ready: Error Handled
    Ready --> Shutdown: Termination Signal
    Shutdown --> [*]

    state Processing {
        [*] --> Validate
        Validate --> Execute
        Execute --> Format
        Format --> [*]
    }
```

## Benefits of MCP Architecture

1. **Standardization**: Consistent tool interface across all servers
2. **Isolation**: Each server runs in its own process
3. **Reliability**: Server failures don't crash the main agent
4. **Scalability**: Easy to add new research domains
5. **Type Safety**: JSON schema validation for all tool calls
6. **Debugging**: Clear separation of concerns for troubleshooting