# Implementation Guide for qi-v2-ts

## Understanding the Architecture

### Key Insight: Claude Code as Orchestrator, MCP Servers as Workers

```
Claude Code (Anthropic API) ←→ MCP Protocol ←→ Independent Python Processes + Local Ollama
    ↑                              ↑                          ↑
Orchestration                Text I/O Only            Heavy Processing + Local LLM
Task Planning               No LLM Access              Full Privacy + Zero Cost
Result Synthesis           Tool Calls/Responses        Domain Specialization
```

**Critical Understanding:**
- Claude Code does NOT access Ollama directly
- MCP servers are completely independent processes
- Each MCP server has its own local Ollama connection
- Claude Code only receives final text results
- All research processing happens locally with zero API cost

## Implementation Steps

### 1. Setup Local Environment

```bash
cd ~/dev/qi/github/qi-v2-ts

# Setup Ollama + Qwen models
./setup-ollama.sh

# Install Python dependencies for MCP servers
cd servers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Test Individual Components

```bash
# Test Ollama connection
python test-ollama.py

# Test individual MCP servers
cd servers/deep-research-agent
python src/deep_research_agent/mcp_server.py

# Should start server waiting for MCP communication
```

### 3. Configure Claude Code

Add to Claude Code settings (`claude-code-config.json`):

```json
{
  "mcpServers": {
    "deep-research-agent": {
      "command": "python",
      "args": ["servers/deep-research-agent/src/deep_research_agent/mcp_server.py"],
      "env": {
        "DEEP_RESEARCH_AGENT_PATH": "/home/zzhang/dev/qi/github/qi-v2-ts/research/DeepResearchAgent",
        "OLLAMA_URL": "http://localhost:11434"
      }
    }
  }
}
```

### 4. Test Research Workflow

In Claude Code, try these commands:

```
# Literature review using local LLM
Use the time_series_literature_review tool to research "multi-scale finite state models for time series segmentation"

# The MCP server will:
# 1. Receive your request
# 2. Use local Ollama + Qwen2.5 for research
# 3. Return comprehensive literature review
# 4. You'll see the results in Claude Code
```

## Sample Research Workflow

### Phase 1: Literature Review
```
Human: Research the latest advances in time series segmentation using finite state models

Claude Code → time_series_literature_review("finite state models segmentation")
  ↓
Deep Research Agent MCP Server:
  - Uses local Qwen2.5 to generate research queries
  - Searches web for recent papers
  - Analyzes and synthesizes findings
  - Returns comprehensive literature review
  ↓
Claude Code: Receives text report, plans next research steps
```

### Phase 2: Data Analysis
```
Claude Code → load_dataset("financial_time_series")
  ↓
TS Analysis MCP Server:
  - Loads data using pandas/numpy
  - Uses local Qwen2.5 for data analysis insights
  - Returns dataset summary and characteristics
  ↓
Claude Code: Plans preprocessing and modeling steps
```

### Phase 3: Model Development
```
Claude Code → create_multi_scale_fsm(specifications)
  ↓
FSM MCP Server:
  - Uses local Qwen2.5 to generate PyTorch architecture
  - Implements multi-scale finite state model
  - Returns model implementation and training results
  ↓
Claude Code: Evaluates results and plans next experiments
```

## Architecture Benefits for Implementation

### 1. **Development Workflow**
- Use Claude Code for high-level research planning
- Each MCP server handles specialized domain work
- Local LLM provides unlimited processing power
- Clean separation allows independent development

### 2. **Cost Optimization**
- Claude Code API costs only for orchestration
- Heavy research computation is free (local Ollama)
- Optimal cost/performance balance

### 3. **Privacy & Security**
- Sensitive research data never leaves local machine
- Time series data processed entirely locally
- Only high-level summaries shared with Claude Code

### 4. **Extensibility**
- Add new research domains by creating new MCP servers
- Upgrade local models independently
- Customize prompts and workflows per domain

## Troubleshooting

### Common Issues

1. **Ollama Not Running**
   ```bash
   ollama serve
   # Test: curl http://localhost:11434/api/tags
   ```

2. **MCP Server Not Starting**
   ```bash
   cd servers/deep-research-agent
   python -m pip install -e .
   python src/deep_research_agent/mcp_server.py
   ```

3. **Claude Code Can't Find Tools**
   - Check claude-code-config.json paths
   - Ensure MCP servers are executable
   - Verify environment variables

### Validation Steps

1. **Ollama Health**: `python test-ollama.py`
2. **MCP Server Health**: Test each server individually
3. **Claude Code Integration**: Verify tools appear in Claude Code
4. **End-to-End Test**: Run a simple research query

## Next Steps for Implementation

1. **Start with Deep Research Agent**: Get literature review working first
2. **Add TS Analysis Server**: Build data loading and preprocessing
3. **Implement FSM Server**: Create multi-scale model capabilities
4. **Add Segmentation Server**: Implement change point detection
5. **Optimize Workflows**: Tune prompts and processing pipelines

Remember: The architecture is designed so you can implement incrementally. Start with one MCP server and build up the research capabilities step by step.