---
title: LangChain Agent Boilerplate
tags: [langchain, python, ai, llm]
collection: AI/ML
createdAt: "2023-11-15T12:00:00Z"
updatedAt: "2023-11-15T12:00:00Z"
variables:
  - key: agentName
    label: Agent Name
    type: string
    required: true
  - key: llmProvider
    label: LLM Provider
    type: select
    options: [OpenAI, Anthropic, Hugging Face, Ollama]
    required: true
---

Generate a Python script for a basic LangChain agent that uses a search tool to answer questions.

# {{agentName}} - LangChain Agent

A Python-based AI agent built with LangChain that can search the web and answer questions intelligently.

## Features

- **LangChain Integration**: Built on the LangChain framework
- **{{llmProvider}} LLM**: Powered by {{llmProvider}} language models
- **Tool Integration**: Web search and custom tool support
- **Memory Management**: Conversation history and context retention
- **Streaming Responses**: Real-time response streaming
- **Error Handling**: Robust error handling and logging

## Prerequisites

- Python 3.8+
- {{llmProvider}} API key
- Internet connection for web search

## Installation

```bash
# Clone the repository
git clone https://github.com/username/{{agentName}}.git
cd {{agentName}}

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# {{llmProvider}} Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Search Configuration
SERPAPI_API_KEY=your_serpapi_key_here

# Agent Configuration
AGENT_NAME={{agentName}}
MAX_ITERATIONS=10
VERBOSE=true
```

## Usage

### Basic Usage

```python
from langchain_agent import {{agentName}}Agent

# Initialize the agent
agent = {{agentName}}Agent()

# Ask a question
response = agent.run("What are the latest developments in AI?")
print(response)
```

### Advanced Usage

```python
from langchain_agent import {{agentName}}Agent
from langchain.memory import ConversationBufferMemory

# Initialize with custom memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

agent = {{agentName}}Agent(
    memory=memory,
    verbose=True,
    max_iterations=15
)

# Interactive conversation
while True:
    user_input = input("You: ")
    if user_input.lower() in ['quit', 'exit']:
        break
    
    response = agent.run(user_input)
    print(f"Agent: {response}")
```

## Project Structure

```
{{agentName}}/
├── src/
│   ├── __init__.py
│   ├── agent.py              # Main agent implementation
│   ├── tools/                # Custom tools
│   │   ├── __init__.py
│   │   ├── search_tool.py
│   │   └── custom_tools.py
│   ├── prompts/              # Prompt templates
│   │   ├── __init__.py
│   │   └── agent_prompts.py
│   └── utils/                # Utility functions
│       ├── __init__.py
│       └── helpers.py
├── tests/                    # Unit tests
├── examples/                 # Usage examples
├── requirements.txt
├── .env.example
└── README.md
```

## Core Components

### Agent Implementation

```python
from langchain.agents import initialize_agent, AgentType
from langchain.tools import DuckDuckGoSearchRun
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

class {{agentName}}Agent:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.7)
        self.tools = [DuckDuckGoSearchRun()]
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=True
        )
    
    def run(self, query: str) -> str:
        return self.agent.run(query)
```

## Available Tools

- **Web Search**: DuckDuckGo search integration
- **Calculator**: Mathematical calculations
- **Wikipedia**: Wikipedia article lookup
- **Custom Tools**: Add your own tools easily

## Customization

### Adding Custom Tools

```python
from langchain.tools import Tool

def custom_calculator(query: str) -> str:
    """Custom calculator tool"""
    try:
        result = eval(query)
        return f"The result is: {result}"
    except:
        return "Invalid calculation"

calculator_tool = Tool(
    name="Calculator",
    func=custom_calculator,
    description="Useful for mathematical calculations"
)
```

### Custom Prompts

```python
AGENT_PROMPT = """
You are {{agentName}}, a helpful AI assistant.
You have access to the following tools:
{tools}

Use the following format:
Question: the input question
Thought: think about what to do
Action: the action to take
Action Input: the input to the action
Observation: the result of the action
Thought: I now know the final answer
Final Answer: the final answer
"""
```

## Testing

```bash
# Run unit tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=src/

# Run specific test
python -m pytest tests/test_agent.py::test_basic_query
```

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
COPY .env .

CMD ["python", "-m", "src.agent"]
```

### API Deployment

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
agent = {{agentName}}Agent()

class Query(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(query: Query):
    response = agent.run(query.question)
    return {"answer": response}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
