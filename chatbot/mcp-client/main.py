import asyncio
import json
import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from fastmcp.client import Client
from fastmcp.client.transports import PythonStdioTransport
from openai import AsyncOpenAI
import helper_functions
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "mcp-server", ".env"))

app = Flask(__name__)
CORS(app)  # Allow CORS for Laravel frontend

message_history = {}
SYS_PROMPT = {
    "role": "system",
    "content": """You are a helpful assistant. Your job is to assist the user by all means possible.
    Make sure to format your message like utilizing newlines, lists and tables."""
}

async def mcpCall(tool_call: dict, client):
    if tool_call["type"] == "tool":
        if len(tool_call["function"]["arguments"].items()) != 0:
            return await client.call_tool(tool_call["function"]["name"], tool_call["function"]["arguments"])
        else:
            return await client.call_tool(tool_call["function"]["name"])
    if tool_call["type"] == "resource":
        return await client.read_resource(tool_call["function"]["name"])
    if tool_call["type"] == "resource_template":
        a_uri = re.split(r"{|}", tool_call["function"]["name"])
        i = 0
        for key, value in tool_call["function"]["arguments"].items():
            a_uri[i * 2 + 1] = value
            i += 1
        uri = "".join(a_uri)
        return await client.read_resource(uri)

@app.route('/ask', methods=['POST'])
async def ask():
    data = request.get_json()
    if not data or 'question' not in data:
        logger.error("Missing question in request")
        return jsonify({'error': 'Missing question'}), 400

    question = data['question']
    user_id = data.get('user', 'default_user')  # Use user ID from request or default
    logger.info(f"Received question from user {user_id}: {question}")

    try:
        # Initialize MCP client
        server_path = os.path.join(os.path.dirname(__file__), "..", "mcp-server", "server.py")
        python_cmd = os.path.join(os.path.dirname(__file__), "..", ".venv", "Scripts", "python.exe")
        async with Client(PythonStdioTransport(script_path=server_path, python_cmd=python_cmd)) as client:
            # Load tools and resources
            tool_list = await client.list_tools()
            resource_list = await client.list_resources()
            resource_template_list = await client.list_resource_templates()
            tools = [json.loads(tool.model_dump_json()) for tool in tool_list]
            tools = helper_functions.mcp_tools_to_tool_list(tools)
            resources = [json.loads(resource.model_dump_json()) for resource in resource_list]
            resources = helper_functions.mcp_resources_to_tool_list(resources)
            resource_templates = [json.loads(resource_template.model_dump_json()) for resource_template in resource_template_list]
            resource_templates = helper_functions.mcp_resource_templates_to_tool_list(resource_templates)

            tool_list = [tool["function"]["name"] for tool in tools]
            resource_list = [resource["function"]["name"] for resource in resources]
            resource_template_list = [resource_template["function"]["name"] for resource_template in resource_templates]
            tool_lookup = {tool: "tool" for tool in tool_list}
            tool_lookup.update({resource: "resource" for resource in resource_list})
            tool_lookup.update({resource_template: "resource_template" for resource_template in resource_template_list})
            list_of_tools = tools + resources + resource_templates

            # Initialize LLM
            llm = AsyncOpenAI(
                base_url=os.getenv("BASE_API_URL"),
                api_key=os.getenv("ALIBABA_API_KEY")
            )

            # Initialize message history for user
            if user_id not in message_history:
                message_history[user_id] = []

            # Add user question to history
            message_history[user_id].append({"role": "user", "content": question})

            # Call LLM
            response = await llm.chat.completions.create(
                model="qwen-plus",
                messages=[SYS_PROMPT] + message_history[user_id],
                tools=list_of_tools
            )

            if not response.choices or len(response.choices) == 0:
                logger.error("Empty choices in LLM response")
                return jsonify({'error': 'No response from LLM'}), 500

            if response.choices[0].finish_reason == "stop":
                answer = response.choices[0].message.content
                message_history[user_id].append({"role": "assistant", "content": answer})
                logger.info(f"Returning answer: {answer}")
                return jsonify({'answer': answer})

            elif response.choices[0].finish_reason == "tool_calls":
                tool_calls = [tool.to_dict() for tool in response.choices[0].message.tool_calls]
                message_history[user_id].append({"role": "assistant", "content": None, "tool_calls": response.choices[0].message.tool_calls})
                for i in range(len(tool_calls)):
                    tool_calls[i]["function"]["arguments"] = json.loads(tool_calls[i]["function"]["arguments"])
                    tool_calls[i]["type"] = tool_lookup[tool_calls[i]["function"]["name"]]
                    tmp = await mcpCall(tool_calls[i], client)
                    message_history[user_id].append({
                        "role": "tool",
                        "content": tmp[0].text,
                        "tool_call_id": tool_calls[i]["id"]
                    })
                    if "error" in tmp[0].text:
                        logger.error(f"Tool call error: {tmp[0].text}")
                        return jsonify({'error': json.loads(tmp[0].text)}), 500
                    else:
                        # Run LLM again with tool results
                        response = await llm.chat.completions.create(
                            model="qwen-plus",
                            messages=[SYS_PROMPT] + message_history[user_id],
                            tools=list_of_tools
                        )
                        if response.choices[0].finish_reason == "stop":
                            answer = response.choices[0].message.content
                            message_history[user_id].append({"role": "assistant", "content": answer})
                            logger.info(f"Returning answer after tool call: {answer}")
                            return jsonify({'answer': answer})

        return jsonify({'error': 'Unexpected error in processing'}), 500

    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
