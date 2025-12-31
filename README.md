# GHL Custom Fields API

API intermedia para actualizar custom fields de contactos en GoHighLevel.
Soporta JSON directo y output del CRM Data Governance Agent (formato `|||`).

## Setup

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `GHL_API_KEY` | Private Integration Token de GHL |
| `GHL_LOCATION_ID` | Location ID de tu sub-account |
| `API_SECRET` | Secreto para autenticar requests |
| `PORT` | Puerto del servidor (default: 3000) |

## Endpoints

### 1. Update desde CRM Agent (Formato |||)
```bash
POST /api/agent/:contactId/update
Content-Type: application/json
X-API-Key: tu_api_secret

{
  "rawOutput": "Project Type ||| Driveway\nMaterial Preference ||| Pavers\n..."
}
```

### 2. Update JSON Directo
```bash
POST /api/contacts/:contactId/update
Content-Type: application/json
X-API-Key: tu_api_secret

{
  "project_type": "Driveway",
  "material_preference": "Pavers"
}
```

### 3. Upsert Contact
```bash
POST /api/contacts/upsert
```

### 4. Debug Parser
```bash
POST /api/agent/parse
# Retorna el JSON parseado sin actualizar GHL
```

## Flujo de Integración

```
CRM Data Governance Agent
         ↓
   Output ||| format
         ↓
    Esta API (parser)
         ↓
      JSON mapped
         ↓
    GHL API v2 PUT
```

## Obtener Credenciales GHL

1. GHL → Settings → Integrations → Private Integrations
2. Crear nueva → Scopes: `contacts.read`, `contacts.write`
3. Copiar token
