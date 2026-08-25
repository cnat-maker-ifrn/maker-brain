export function extractServerErrors(error) {
  if (!error?.response) {
    // No response reached the client: network failure or a CORS-blocked response.
    // eslint-disable-next-line no-console
    console.error('Request failed with no response (check CORS/network):', error);
    return {
      non_field_errors:
        'Não foi possível conectar ao servidor. Verifique sua conexão ou a configuração de CORS do backend.',
    };
  }

  const data = error.response.data;
  if (!data || typeof data !== 'object') {
    return { non_field_errors: `Erro inesperado do servidor (status ${error.response.status}).` };
  }

  return Object.fromEntries(
    Object.entries(data).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(' ') : String(messages),
    ])
  );
}