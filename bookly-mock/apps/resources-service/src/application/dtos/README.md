# Application DTOs - Resources Service

Esta carpeta contiene los Data Transfer Objects (DTOs) de la capa de aplicación.

## Propósito

Los DTOs de aplicación se utilizan para transferir datos entre handlers, servicios y comandos/queries.

## Diferencia con infrastructure/dto

- **application/dtos**: DTOs internos usados entre handlers y servicios
- **infrastructure/dto**: DTOs de API (request/response) usados en controllers

## Ejemplos

- `CreateResourceDto` - DTO para crear un recurso (interno)
- `UpdateResourceDto` - DTO para actualizar un recurso (interno)
- `ResourceResponseDto` - DTO de respuesta con datos del recurso
