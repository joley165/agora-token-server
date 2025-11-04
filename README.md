# Servidor de Tokens Agora

Servidor backend para generar tokens RTC de Agora con App Certificate.

## Despliegue en Railway

Variables de entorno requeridas:
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

## Endpoint

POST /api/agora/token
Body: { "channelName": "string", "uid": number, "role": "publisher"|"subscriber" }

