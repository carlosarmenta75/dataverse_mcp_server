#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DataverseClient } from "./dataverse-client.js";

const client = new DataverseClient(
  process.env.DATAVERSE_URL!,
  process.env.TENANT_ID!,
  process.env.CLIENT_ID!,
  process.env.CLIENT_SECRET!
);

const server = new Server(
  {
    name: "mcp-dataverse-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_record",
      description: "Create a new record in a Dataverse table",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table logical name (e.g., 'accounts')" },
          data: { type: "object", description: "Record data as key-value pairs" },
        },
        required: ["table", "data"],
      },
    },
    {
      name: "update_record",
      description: "Update an existing record in a Dataverse table",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table logical name" },
          id: { type: "string", description: "Record GUID" },
          data: { type: "object", description: "Fields to update" },
        },
        required: ["table", "id", "data"],
      },
    },
    {
      name: "delete_record",
      description: "Delete a record from a Dataverse table",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table logical name" },
          id: { type: "string", description: "Record GUID" },
        },
        required: ["table", "id"],
      },
    },
    {
      name: "query_records",
      description: "Query records from a Dataverse table with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table logical name" },
          select: { type: "array", items: { type: "string" }, description: "Columns to retrieve" },
          filter: { type: "string", description: "OData filter expression" },
          top: { type: "number", description: "Max records to return" },
        },
        required: ["table"],
      },
    },
    {
      name: "list_tables",
      description: "List all available Dataverse tables",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_table_schema",
      description: "Get schema information for a specific table",
      inputSchema: {
        type: "object",
        properties: {
          table: { type: "string", description: "Table logical name" },
        },
        required: ["table"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_record": {
        const result = await client.createRecord(args.table, args.data);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "update_record": {
        await client.updateRecord(args.table, args.id, args.data);
        return { content: [{ type: "text", text: "Record updated successfully" }] };
      }
      case "delete_record": {
        await client.deleteRecord(args.table, args.id);
        return { content: [{ type: "text", text: "Record deleted successfully" }] };
      }
      case "query_records": {
        const result = await client.queryRecords(args.table, args.select, args.filter, args.top);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "list_tables": {
        const result = await client.listTables();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "get_table_schema": {
        const result = await client.getTableSchema(args.table);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Dataverse Server running on stdio");
}

main().catch(console.error);
