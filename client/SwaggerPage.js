import React from 'react';

export default function SwaggerPage() {
  return (
    <iframe
      src="http://localhost:8080/swagger-ui"
      title="Swagger UI"
      style={{ width: '100vw', height: '100vh', border: 'none' }}
    />
  );
}
