const sanitizePayload = (table, payload) => {
  const base = {
    id: payload.id,
    user_id: payload.user_id,
  };
  let clean = { ...base };
  switch (table) {
    case 'receitas':
      clean = {
        ...clean,
        description: payload.description || 'Receita sem nome',
        date: payload.date || new Date().toISOString().split('T')[0],
        value: Number(payload.value) || 0,
        category: payload.category || 'Outras',
        status: payload.status || 'Previsto',
      };
      delete clean.account;
      delete clean.bank;
      delete clean.observations;
      break;
    case 'parcelas':
      clean = {
        ...clean,
        description: payload.description || 'Parcela sem nome',
        date: payload.date || new Date().toISOString().split('T')[0],
        value: Number(payload.value) || 0,
        method: payload.method || 'Outros',
        account: payload.account || payload.bank || 'Outros',
        currentInstallment: Number(payload.currentInstallment) || 1,
        totalInstallments: Number(payload.totalInstallments) || 1,
        status: payload.status || 'Pendente',
        type: payload.type || 'Parcela',
      };
      delete clean.seriesId;
      delete clean.observations;
      delete clean.bank;
      break;
  }
  return clean;
};

const payload = sanitizePayload('receitas', { id: '123', value: 10, account: 'Santander' });
console.log(payload);

const payloadParcelas = sanitizePayload('parcelas', { id: '321', value: 10, seriesId: 'asdf' });
console.log(payloadParcelas);
