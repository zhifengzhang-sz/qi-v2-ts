# Research Workflow Architecture

## Research Process Overview

qi-v2-ts implements a structured research workflow that combines literature review, methodology development, experimentation, and analysis.

## Workflow Stages

```mermaid
graph TB
    subgraph "Research Planning"
        RP[Research Question] --> LR[Literature Review]
        LR --> GA[Gap Analysis]
        GA --> HF[Hypothesis Formation]
    end

    subgraph "Methodology Development"
        HF --> MD[Method Design]
        MD --> IP[Implementation Planning]
        IP --> EX[Experimental Design]
    end

    subgraph "Implementation"
        EX --> DL[Data Loading]
        DL --> PP[Preprocessing]
        PP --> MI[Model Implementation]
        MI --> TR[Training]
    end

    subgraph "Evaluation"
        TR --> EV[Evaluation]
        EV --> AN[Analysis]
        AN --> VI[Visualization]
        VI --> RP[Report Generation]
    end

    subgraph "Iteration"
        RP --> RF[Refinement]
        RF --> MD
    end

    style RP fill:#e1f5fe
    style LR fill:#fff3e0
    style MD fill:#f1f8e9
    style MI fill:#fce4ec
    style EV fill:#e0f2f1
```

## Tool Integration Workflow

```mermaid
sequenceDiagram
    participant R as Researcher
    participant CC as Claude Code
    participant DRA as Deep Research Agent
    participant TSA as TS Analysis
    participant FSM as FSM Server
    participant SEG as Segmentation
    participant OL as Ollama

    Note over R,OL: Phase 1: Literature Review
    R->>CC: "Research multi-scale FSM for time series segmentation"
    CC->>DRA: time_series_literature_review("segmentation")
    DRA->>OL: Generate research queries
    OL-->>DRA: Literature synthesis
    DRA-->>CC: Comprehensive review

    Note over R,OL: Phase 2: Data Preparation
    CC->>TSA: load_dataset("benchmark_ts_data")
    TSA-->>CC: Dataset loaded
    CC->>TSA: preprocess_ts(normalize=True, denoise=True)
    TSA-->>CC: Preprocessed data

    Note over R,OL: Phase 3: Model Development
    CC->>FSM: create_fsm(scales=[1,2,4], states=[3,5,8])
    FSM->>OL: Generate model architecture
    OL-->>FSM: PyTorch implementation
    FSM-->>CC: Model created

    Note over R,OL: Phase 4: Training & Segmentation
    CC->>FSM: train_fsm(data, epochs=100)
    FSM-->>CC: Trained model
    CC->>SEG: segment_time_series(model, data)
    SEG-->>CC: Segmentation results

    Note over R,OL: Phase 5: Evaluation
    CC->>SEG: evaluate_segmentation(results, ground_truth)
    SEG-->>CC: Performance metrics
    CC->>TSA: visualize_ts(data, segments)
    TSA-->>CC: Visualization plots

    Note over R,OL: Phase 6: Analysis & Reporting
    CC->>DRA: deep_research("analyze FSM segmentation performance")
    DRA->>OL: Performance analysis
    OL-->>DRA: Insights and recommendations
    DRA-->>CC: Analysis report
    CC-->>R: Comprehensive research results
```

## Research Task Types

### 1. Literature Review Tasks

```mermaid
graph LR
    subgraph "Literature Review"
        Q[Research Query] --> ST[Search Terms]
        ST --> PA[Paper Analysis]
        PA --> CI[Citation Mining]
        CI --> TR[Trend Analysis]
        TR --> SY[Synthesis]
    end

    subgraph "Tools"
        DRA[Deep Research Agent]
        OL[Ollama Models]
        WS[Web Search]
    end

    PA --> DRA
    CI --> DRA
    TR --> OL
    SY --> OL
    DRA --> WS
```

### 2. Model Development Tasks

```mermaid
graph LR
    subgraph "Model Development"
        SP[Specification] --> AR[Architecture]
        AR --> IM[Implementation]
        IM --> VA[Validation]
        VA --> OP[Optimization]
    end

    subgraph "Tools"
        FSM[FSM Server]
        OL[Ollama Code Gen]
        TSA[TS Analysis]
    end

    AR --> FSM
    IM --> OL
    VA --> TSA
    OP --> FSM
```

### 3. Experimental Tasks

```mermaid
graph LR
    subgraph "Experimentation"
        ED[Experiment Design] --> DL[Data Loading]
        DL --> EX[Execution]
        EX --> ME[Metrics]
        ME --> AN[Analysis]
    end

    subgraph "Tools"
        TSA[TS Analysis]
        SEG[Segmentation]
        FSM[FSM Server]
        OL[Ollama Analysis]
    end

    DL --> TSA
    EX --> SEG
    EX --> FSM
    ME --> SEG
    AN --> OL
```

## Workflow Orchestration

### Agent Planning

```mermaid
graph TB
    subgraph "Claude Code Planning"
        RQ[Research Question] --> TA[Task Analysis]
        TA --> TD[Task Decomposition]
        TD --> TS[Tool Selection]
        TS --> SO[Sequence Optimization]
        SO --> EP[Execution Plan]
    end

    subgraph "Available Tools"
        T1[Literature Review]
        T2[Data Processing]
        T3[Model Development]
        T4[Evaluation]
        T5[Visualization]
    end

    TS --> T1
    TS --> T2
    TS --> T3
    TS --> T4
    TS --> T5

    style RQ fill:#e1f5fe
    style EP fill:#e8f5e8
```

### Execution Monitoring

```mermaid
stateDiagram-v2
    [*] --> Planning
    Planning --> Executing: Plan Ready
    Executing --> Monitoring: Task Started
    Monitoring --> Success: Task Complete
    Monitoring --> Error: Task Failed
    Success --> NextTask: More Tasks
    Success --> Complete: All Done
    Error --> Retry: Recoverable
    Error --> Abort: Critical
    Retry --> Executing
    NextTask --> Executing
    Complete --> [*]
    Abort --> [*]
```

## Research Patterns

### 1. Comparative Study Pattern

```python
# Example workflow for comparing segmentation methods
async def comparative_study():
    # Literature review
    literature = await deep_research("time series segmentation methods comparison")

    # Data preparation
    datasets = await load_benchmark_datasets()

    # Method implementation
    methods = [
        await implement_fsm_segmentation(),
        await implement_hmm_segmentation(),
        await implement_cpt_segmentation()
    ]

    # Evaluation
    results = []
    for method in methods:
        result = await evaluate_method(method, datasets)
        results.append(result)

    # Analysis
    analysis = await compare_results(results)
    report = await generate_report(analysis)

    return report
```

### 2. Novel Method Development Pattern

```python
# Example workflow for developing new FSM approach
async def novel_method_development():
    # Gap analysis
    gaps = await analyze_literature_gaps("multi-scale FSM")

    # Method design
    design = await design_novel_approach(gaps)

    # Implementation
    model = await implement_multi_scale_fsm(design)

    # Validation
    validation = await validate_method(model)

    # Refinement
    refined_model = await refine_method(model, validation)

    return refined_model
```

## Integration Benefits

1. **Systematic Approach**: Structured research process
2. **Tool Synergy**: Tools work together seamlessly
3. **Reproducibility**: Documented workflow steps
4. **Efficiency**: Automated routine tasks
5. **Quality**: Built-in validation and verification
6. **Traceability**: Complete research audit trail