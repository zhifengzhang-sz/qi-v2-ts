# Deployment Architecture

## Deployment Overview

qi-v2-ts is designed for local deployment with minimal external dependencies. All components run on a single machine with local LLM processing.

## Deployment Topology

```mermaid
graph TB
    subgraph "Local Machine"
        subgraph "User Interface"
            UI[Claude Code Interface]
            WEB[Web Browser]
            CLI[Command Line]
        end

        subgraph "Agent Layer"
            CC[Claude Code Process]
            MCP[MCP Client]
        end

        subgraph "MCP Servers"
            OP[Ollama Proxy]
            DRA[Deep Research Agent]
            TSA[TS Analysis]
            FSM[FSM Server]
            SEG[Segmentation]
        end

        subgraph "Services"
            OL[Ollama Service]
            PY[Python Environments]
        end

        subgraph "Storage"
            FS[File System]
            CACHE[Cache Directory]
            LOGS[Log Files]
        end
    end

    subgraph "External (Optional)"
        WEB_EXT[Web Search APIs]
        GIT[Git Repositories]
    end

    UI --> CC
    WEB --> CC
    CLI --> CC

    CC --> MCP
    MCP --> OP
    MCP --> DRA
    MCP --> TSA
    MCP --> FSM
    MCP --> SEG

    OP --> OL
    DRA --> OL
    DRA --> PY
    TSA --> PY
    FSM --> PY
    SEG --> PY

    PY --> FS
    OL --> FS
    CC --> CACHE
    CC --> LOGS

    DRA -.-> WEB_EXT
    DRA -.-> GIT

    style UI fill:#e1f5fe
    style OL fill:#e8f5e8
    style FS fill:#f3e5f5
```

## System Requirements

### Hardware Requirements

```mermaid
graph LR
    subgraph "Minimum Requirements"
        M_CPU[CPU: 4 cores]
        M_RAM[RAM: 16GB]
        M_GPU[GPU: Optional]
        M_DISK[Disk: 100GB SSD]
    end

    subgraph "Recommended Requirements"
        R_CPU[CPU: 8+ cores]
        R_RAM[RAM: 32GB]
        R_GPU[GPU: 8GB VRAM]
        R_DISK[Disk: 500GB NVMe]
    end

    subgraph "Performance Impact"
        M_CPU --> P_SLOW[Slower processing]
        R_CPU --> P_FAST[Fast processing]
        M_RAM --> P_LIMIT[Limited model size]
        R_RAM --> P_LARGE[Large models]
        M_GPU --> P_CPU[CPU inference]
        R_GPU --> P_GPU[GPU acceleration]
    end
```

### Software Dependencies

```mermaid
graph TB
    subgraph "Base System"
        OS[Linux/macOS/Windows]
        SHELL[Bash/Zsh]
        GIT_S[Git]
    end

    subgraph "Runtime Environments"
        PY[Python 3.11+]
        NODE[Node.js 18+]
        OLLAMA[Ollama]
    end

    subgraph "Package Managers"
        PIP[pip]
        PYENV[pyenv (optional)]
        NPM[npm]
    end

    subgraph "Claude Code"
        CC_APP[Claude Code Application]
        MCP_SDK[MCP SDK]
    end

    OS --> PY
    OS --> NODE
    OS --> OLLAMA
    PY --> PIP
    PY --> PYENV
    NODE --> NPM
    CC_APP --> MCP_SDK
```

## Installation Process

### 1. Automated Setup

```mermaid
graph TB
    START[Start Installation] --> CHECK[Check Prerequisites]
    CHECK -->|Missing| INSTALL_DEPS[Install Dependencies]
    CHECK -->|OK| SETUP_OLLAMA[Setup Ollama]

    INSTALL_DEPS --> SETUP_OLLAMA
    SETUP_OLLAMA --> PULL_MODELS[Pull Qwen Models]
    PULL_MODELS --> SETUP_PYTHON[Setup Python Environment]
    SETUP_PYTHON --> INSTALL_SERVERS[Install MCP Servers]
    INSTALL_SERVERS --> CONFIG_CC[Configure Claude Code]
    CONFIG_CC --> TEST[Test Installation]
    TEST -->|Pass| COMPLETE[Installation Complete]
    TEST -->|Fail| DEBUG[Debug Issues]
    DEBUG --> TEST
```

### 2. Setup Scripts

```bash
#!/bin/bash
# setup.sh - Main setup script

echo "🚀 Setting up qi-v2-ts research framework..."

# Check prerequisites
./scripts/check-prerequisites.sh

# Setup Ollama and models
./setup-ollama.sh

# Setup Python environments
./scripts/setup-python.sh

# Configure Claude Code
./scripts/configure-claude-code.sh

# Run tests
./scripts/test-installation.sh

echo "✅ qi-v2-ts setup complete!"
```

## Configuration Management

### 1. Configuration Structure

```mermaid
graph TB
    subgraph "Configuration Files"
        CC_CONFIG[claude-code-config.json]
        ENV_CONFIG[.env files]
        SERVER_CONFIGS[Server Configs]
        MODEL_CONFIGS[Model Configs]
    end

    subgraph "Environment Variables"
        OLLAMA_URL
        PYTHONPATH
        LOG_LEVEL
        CACHE_DIR
    end

    subgraph "Runtime Settings"
        MCP_SERVERS[MCP Server Definitions]
        MODEL_PARAMS[Model Parameters]
        TOOL_CONFIGS[Tool Configurations]
    end

    CC_CONFIG --> MCP_SERVERS
    ENV_CONFIG --> OLLAMA_URL
    ENV_CONFIG --> PYTHONPATH
    SERVER_CONFIGS --> TOOL_CONFIGS
    MODEL_CONFIGS --> MODEL_PARAMS
```

### 2. Configuration Templates

```json
{
  "claude-code-config.json": {
    "mcpServers": {
      "ollama-proxy": {
        "command": "python",
        "args": ["servers/ollama-proxy/src/ollama_proxy/mcp_server.py"],
        "env": {
          "OLLAMA_URL": "http://localhost:11434"
        }
      }
    }
  }
}
```

## Service Management

### 1. Service Architecture

```mermaid
stateDiagram-v2
    [*] --> Stopped
    Stopped --> Starting: Start Command
    Starting --> Running: Services Ready
    Running --> Stopping: Stop Command
    Running --> Error: Service Failure
    Error --> Starting: Restart
    Stopping --> Stopped: Clean Shutdown

    state Running {
        [*] --> Ollama
        Ollama --> MCPServers
        MCPServers --> ClaudeCode
    }
```

### 2. Process Management

```bash
# Service management scripts

# Start all services
./scripts/start-services.sh

# Stop all services
./scripts/stop-services.sh

# Restart services
./scripts/restart-services.sh

# Check service status
./scripts/check-services.sh
```

## Monitoring and Logging

### 1. Logging Architecture

```mermaid
graph TB
    subgraph "Log Sources"
        CC_LOG[Claude Code]
        MCP_LOG[MCP Servers]
        OL_LOG[Ollama]
        APP_LOG[Application Logs]
    end

    subgraph "Log Aggregation"
        COLLECT[Log Collector]
        PARSE[Log Parser]
        FILTER[Log Filter]
    end

    subgraph "Log Storage"
        FILES[Log Files]
        ROTATE[Log Rotation]
        ARCHIVE[Log Archive]
    end

    subgraph "Monitoring"
        ALERT[Error Alerts]
        DASH[Dashboard]
        METRICS[Metrics]
    end

    CC_LOG --> COLLECT
    MCP_LOG --> COLLECT
    OL_LOG --> COLLECT
    APP_LOG --> COLLECT

    COLLECT --> PARSE
    PARSE --> FILTER
    FILTER --> FILES

    FILES --> ROTATE
    ROTATE --> ARCHIVE

    FILTER --> ALERT
    FILTER --> DASH
    FILTER --> METRICS
```

### 2. Health Checks

```mermaid
graph LR
    subgraph "Health Check System"
        HC[Health Checker] --> OL_HC[Ollama Health]
        HC --> MCP_HC[MCP Server Health]
        HC --> CC_HC[Claude Code Health]
    end

    subgraph "Check Results"
        OL_HC --> OL_STATUS[Ollama Status]
        MCP_HC --> MCP_STATUS[MCP Status]
        CC_HC --> CC_STATUS[Claude Code Status]
    end

    subgraph "Actions"
        OL_STATUS -->|Fail| RESTART_OL[Restart Ollama]
        MCP_STATUS -->|Fail| RESTART_MCP[Restart MCP Servers]
        CC_STATUS -->|Fail| NOTIFY[Notify User]
    end
```

## Backup and Recovery

### 1. Backup Strategy

```mermaid
graph TB
    subgraph "Backup Targets"
        CONFIG[Configuration Files]
        DATA[Research Data]
        MODELS[Trained Models]
        RESULTS[Experiment Results]
    end

    subgraph "Backup Methods"
        DAILY[Daily Snapshots]
        INCREMENTAL[Incremental Backups]
        SYNC[Cloud Sync]
    end

    subgraph "Storage Locations"
        LOCAL[Local Storage]
        EXTERNAL[External Drive]
        CLOUD[Cloud Storage]
    end

    CONFIG --> DAILY
    DATA --> INCREMENTAL
    MODELS --> DAILY
    RESULTS --> SYNC

    DAILY --> LOCAL
    INCREMENTAL --> EXTERNAL
    SYNC --> CLOUD
```

### 2. Disaster Recovery

```mermaid
graph LR
    DISASTER[System Failure] --> ASSESS[Assess Damage]
    ASSESS --> RESTORE_CONFIG[Restore Config]
    RESTORE_CONFIG --> RESTORE_DATA[Restore Data]
    RESTORE_DATA --> REINSTALL[Reinstall Services]
    REINSTALL --> VALIDATE[Validate System]
    VALIDATE --> RESUME[Resume Operations]
```

## Scaling Considerations

### 1. Horizontal Scaling

```mermaid
graph TB
    subgraph "Single Machine (Current)"
        CC1[Claude Code]
        MCP1[MCP Servers]
        OL1[Ollama]
    end

    subgraph "Multi-Machine (Future)"
        CC2[Claude Code]
        MCP2[MCP Servers]
        OL2[Ollama Cluster]
    end

    subgraph "Distributed (Advanced)"
        CC3[Claude Code Cluster]
        MCP3[MCP Server Farm]
        OL3[Ollama Grid]
    end

    CC1 --> CC2
    CC2 --> CC3
```

### 2. Performance Tuning

```mermaid
graph LR
    subgraph "Optimization Areas"
        CPU[CPU Usage]
        MEM[Memory Usage]
        DISK[Disk I/O]
        NET[Network]
    end

    subgraph "Tuning Methods"
        PAR[Parallelization]
        CACHE[Caching]
        BATCH[Batching]
        COMP[Compression]
    end

    CPU --> PAR
    MEM --> CACHE
    DISK --> BATCH
    NET --> COMP
```

This deployment architecture ensures a robust, maintainable, and scalable research environment.