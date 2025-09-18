# Data Flow Architecture

## Data Flow Overview

qi-v2-ts implements a multi-layered data flow architecture that handles research information, time series data, model parameters, and results across different components.

## Data Flow Diagram

```mermaid
graph TB
    subgraph "Input Sources"
        RQ[Research Queries]
        DS[Datasets]
        CF[Config Files]
        UP[User Prompts]
    end

    subgraph "Processing Layers"
        subgraph "Agent Layer"
            CC[Claude Code]
            AP[Agent Planner]
            AM[Agent Memory]
        end

        subgraph "Research Layer"
            DRA[Deep Research Agent]
            LIT[Literature DB]
            WEB[Web Sources]
        end

        subgraph "Analysis Layer"
            TSA[TS Analysis]
            FSM[FSM Models]
            SEG[Segmentation]
        end

        subgraph "LLM Layer"
            OL[Ollama]
            QW[Qwen Models]
        end
    end

    subgraph "Output Stores"
        REP[Research Reports]
        MOD[Trained Models]
        VIZ[Visualizations]
        MET[Metrics]
        COD[Generated Code]
    end

    subgraph "Persistent Storage"
        FS[File System]
        EXP[Experiments]
        DAT[Data Cache]
        LOG[Logs]
    end

    %% Input flows
    RQ --> CC
    DS --> TSA
    CF --> CC
    UP --> CC

    %% Processing flows
    CC --> DRA
    CC --> TSA
    CC --> FSM
    CC --> SEG

    DRA --> OL
    TSA --> OL
    FSM --> OL
    SEG --> OL

    DRA <--> LIT
    DRA <--> WEB

    %% Memory flows
    CC <--> AM
    AM <--> FS

    %% Output flows
    DRA --> REP
    FSM --> MOD
    TSA --> VIZ
    SEG --> MET
    OL --> COD

    %% Storage flows
    REP --> EXP
    MOD --> EXP
    VIZ --> EXP
    MET --> EXP
    COD --> EXP

    TSA <--> DAT
    CC --> LOG

    style CC fill:#e1f5fe
    style OL fill:#e8f5e8
    style DRA fill:#fff3e0
    style FS fill:#f3e5f5
```

## Data Types and Formats

### 1. Research Data

```mermaid
classDiagram
    class ResearchQuery {
        +string question
        +string domain
        +string[] focus_areas
        +int max_iterations
        +string model
    }

    class LiteratureResult {
        +string[] papers
        +string synthesis
        +string[] citations
        +string trends
        +string gaps
    }

    class ResearchReport {
        +ResearchQuery query
        +LiteratureResult literature
        +string analysis
        +string[] recommendations
        +timestamp created_at
    }

    ResearchQuery --> LiteratureResult
    LiteratureResult --> ResearchReport
```

### 2. Time Series Data

```mermaid
classDiagram
    class TimeSeriesData {
        +float[] values
        +datetime[] timestamps
        +dict metadata
        +string[] feature_names
        +int sample_rate
    }

    class PreprocessedData {
        +TimeSeriesData raw
        +float[] normalized
        +float[] denoised
        +bool[] missing_mask
        +dict preprocessing_params
    }

    class SegmentationResult {
        +int[] change_points
        +string[] segment_labels
        +float[] confidence_scores
        +dict algorithm_params
        +dict evaluation_metrics
    }

    TimeSeriesData --> PreprocessedData
    PreprocessedData --> SegmentationResult
```

### 3. Model Data

```mermaid
classDiagram
    class FSMConfiguration {
        +int[] scales
        +int[] num_states
        +string transition_type
        +dict hyperparameters
        +string architecture
    }

    class TrainedFSM {
        +FSMConfiguration config
        +tensor[] parameters
        +float[] training_metrics
        +dict state_definitions
        +string model_path
    }

    class ModelEvaluation {
        +TrainedFSM model
        +dict performance_metrics
        +float[] validation_scores
        +string[] error_analysis
        +dict comparison_baselines
    }

    FSMConfiguration --> TrainedFSM
    TrainedFSM --> ModelEvaluation
```

## Data Processing Pipeline

### 1. Research Data Pipeline

```mermaid
graph LR
    subgraph "Research Pipeline"
        Q[Query] --> P[Parse]
        P --> S[Search]
        S --> E[Extract]
        E --> A[Analyze]
        A --> Y[Synthesize]
        Y --> R[Report]
    end

    subgraph "Processing Stages"
        P --> QP[Query Processing]
        S --> WS[Web Search]
        E --> PE[Paper Extraction]
        A --> CA[Citation Analysis]
        Y --> LS[Literature Synthesis]
        R --> RG[Report Generation]
    end

    QP --> DRA[Deep Research Agent]
    WS --> DRA
    PE --> DRA
    CA --> OL[Ollama]
    LS --> OL
    RG --> OL
```

### 2. Time Series Processing Pipeline

```mermaid
graph LR
    subgraph "TS Processing Pipeline"
        L[Load] --> V[Validate]
        V --> C[Clean]
        C --> N[Normalize]
        N --> F[Feature Extract]
        F --> S[Segment]
        S --> E[Evaluate]
    end

    subgraph "Processing Components"
        L --> DL[Data Loader]
        V --> DV[Data Validator]
        C --> DC[Data Cleaner]
        N --> DN[Normalizer]
        F --> FE[Feature Extractor]
        S --> SM[Segmentation Model]
        E --> EM[Evaluation Metrics]
    end

    DL --> TSA[TS Analysis Server]
    DV --> TSA
    DC --> TSA
    DN --> TSA
    FE --> TSA
    SM --> FSM[FSM Server]
    SM --> SEG[Segmentation Server]
    EM --> SEG
```

## Data Storage Architecture

### 1. File System Organization

```mermaid
graph TB
    subgraph "qi-v2-ts/"
        subgraph "data/"
            RAW[raw/]
            PRO[processed/]
            BEN[benchmarks/]
        end

        subgraph "experiments/"
            NOT[notebooks/]
            CON[configs/]
            RES[results/]
        end

        subgraph "models/"
            DOWN[downloads/]
            TRAIN[trained/]
            EVAL[evaluations/]
        end

        subgraph "research/"
            LIT[literature/]
            REP[reports/]
            DRA_DIR[DeepResearchAgent/]
        end
    end

    TSA --> RAW
    TSA --> PRO
    SEG --> BEN

    FSM --> TRAIN
    FSM --> EVAL

    DRA --> LIT
    DRA --> REP
```

### 2. Data Flow Between Servers

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant TSA as TS Analysis
    participant FSM as FSM Server
    participant SEG as Segmentation
    participant FS as File System

    Note over CC,FS: Data Loading Phase
    CC->>TSA: load_dataset("financial_ts")
    TSA->>FS: Read raw data
    FS-->>TSA: Raw time series
    TSA-->>CC: Dataset metadata

    Note over CC,FS: Processing Phase
    CC->>TSA: preprocess_ts(data)
    TSA->>FS: Cache processed data
    TSA-->>CC: Processed data reference

    Note over CC,FS: Modeling Phase
    CC->>FSM: train_fsm(data_ref)
    FSM->>FS: Load processed data
    FSM->>FS: Save trained model
    FSM-->>CC: Model reference

    Note over CC,FS: Evaluation Phase
    CC->>SEG: segment_time_series(model_ref, data_ref)
    SEG->>FS: Load model and data
    SEG->>FS: Save results
    SEG-->>CC: Segmentation results
```

## Data Consistency and Integrity

### 1. Data Validation

```mermaid
graph TB
    subgraph "Validation Pipeline"
        IN[Input Data] --> SCH[Schema Check]
        SCH --> TYP[Type Validation]
        TYP --> RAN[Range Check]
        RAN --> CON[Consistency Check]
        CON --> OUT[Validated Data]
    end

    subgraph "Error Handling"
        SCH -->|Fail| SE[Schema Error]
        TYP -->|Fail| TE[Type Error]
        RAN -->|Fail| RE[Range Error]
        CON -->|Fail| CE[Consistency Error]

        SE --> LOG[Error Log]
        TE --> LOG
        RE --> LOG
        CE --> LOG
    end

    LOG --> CC[Claude Code]
```

### 2. Data Versioning

```mermaid
graph LR
    subgraph "Version Control"
        D1[Data v1.0] --> D2[Data v1.1]
        D2 --> D3[Data v2.0]
        D3 --> D4[Data v2.1]
    end

    subgraph "Experiment Tracking"
        E1[Experiment 1] --> D1
        E2[Experiment 2] --> D2
        E3[Experiment 3] --> D3
        E4[Experiment 4] --> D4
    end

    subgraph "Reproducibility"
        R1[Result 1] --> E1
        R2[Result 2] --> E2
        R3[Result 3] --> E3
        R4[Result 4] --> E4
    end
```

## Performance Optimization

### 1. Caching Strategy

```mermaid
graph TB
    subgraph "Cache Layers"
        L1[Memory Cache]
        L2[Disk Cache]
        L3[Remote Cache]
    end

    subgraph "Data Types"
        PD[Processed Data]
        MR[Model Results]
        LR[Literature Results]
        VZ[Visualizations]
    end

    PD --> L1
    MR --> L1
    LR --> L2
    VZ --> L2

    L1 -->|Overflow| L2
    L2 -->|Backup| L3
```

### 2. Data Streaming

```mermaid
graph LR
    subgraph "Streaming Pipeline"
        SRC[Data Source] --> BUF[Buffer]
        BUF --> PRO[Process]
        PRO --> OUT[Output]
    end

    subgraph "Batch Processing"
        B1[Batch 1] --> BUF
        B2[Batch 2] --> BUF
        B3[Batch 3] --> BUF
    end

    PRO --> TSA[TS Analysis]
    PRO --> FSM[FSM Server]
```

This architecture ensures efficient, reliable, and scalable data flow throughout the research process.