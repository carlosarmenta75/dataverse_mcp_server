# MCP Dataverse Server

MCP server for performing CRUD operations on Microsoft Dataverse databases using service principal authentication.

## Prerequisites

1. **Azure AD App Registration:**
   - Register an application in Azure AD
   - Create a client secret
   - Note the Tenant ID, Client ID, and Client Secret

2. **Dataverse Setup:**
   - Grant the app "Dynamics CRM" API permissions in Azure AD
   - Add the application as a user in Dataverse
   - Assign appropriate security role (e.g., System Administrator)

## Environment Variables

```bash
DATAVERSE_URL=https://yourorg.crm.dynamics.com
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

## Local Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Docker Deployment

```bash
# Build image
docker build -t mcp-dataverse-server .

# Run container
docker run -i \
  -e DATAVERSE_URL=https://yourorg.crm.dynamics.com \
  -e TENANT_ID=your-tenant-id \
  -e CLIENT_ID=your-client-id \
  -e CLIENT_SECRET=your-client-secret \
  mcp-dataverse-server
```

## Available Tools

- **create_record**: Create new records in tables
- **update_record**: Update existing records
- **delete_record**: Delete records
- **query_records**: Query records with OData filters
- **list_tables**: List all available tables
- **get_table_schema**: Get column metadata for a table

## Usage with bolt.new

Configure your bolt.new app to connect to this MCP server via stdio transport. The server handles all authentication transparently.

## Example Operations

**Create a record:**
```json
{
  "table": "accounts",
  "data": {
    "name": "Contoso Ltd",
    "telephone1": "555-0100"
  }
}
```

**Query records:**
```json
{
  "table": "accounts",
  "select": ["name", "telephone1"],
  "filter": "revenue gt 1000000",
  "top": 10
}
```
# dataverse_mcp_server
"# dataverse_mcp_server" 
