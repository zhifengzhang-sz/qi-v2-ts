# qi-v2-ts: Time Series Research with Claude Code + Ollama + MCP

A research framework for time series segmentation using multi-scale finite state models, powered by Claude Code agent capabilities with local Ollama LLMs and specialized MCP servers.

## Architecture

```
Claude Code (Orchestration via Anthropic API)
    ↓ MCP Protocol (Text Only)
Independent MCP Servers with Local Ollama
    ↓ Local Processing (Zero Cost)
├── Deep Research Agent + Qwen2.5
├── Time Series Analysis + Qwen2.5
├── Finite State Models + Qwen2.5
└── Segmentation Tools + Qwen2.5
```

**Key Insight**: Claude Code orchestrates research workflows while MCP servers do heavy processing with local LLMs. This provides the best of both worlds - professional agent capabilities with unlimited local compute.

## Features

- **Local LLM**: Ollama with Qwen3 models (no API costs)
- **Claude Code Integration**: Professional agent interface
- **MCP Servers**: Specialized time series research tools
- **Multi-Scale FSM**: Novel finite state modeling approach
- **Time Series Segmentation**: Advanced change point detection

## Quick Start

```bash
# 1. Setup Ollama and models
./setup-ollama.sh

# 2. Setup MCP servers
cd servers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Test setup
python test-ollama.py

# 4. Configure Claude Code with MCP servers
# Copy claude-code-config.json to Claude Code settings
```

📖 **See [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) for detailed setup instructions**

## Research Focus

Multi-scale finite state models for time series segmentation with applications in:
- Financial market regime detection
- IoT sensor pattern analysis
- Biomedical signal processing
- Industrial process monitoring

## License

MIT