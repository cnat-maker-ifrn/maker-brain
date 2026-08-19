// Mirrors makerauth.validators.validate_cpf and User.clean() enrollment rules.

export function isValidCPF(rawCpf) {
  const cpf = rawCpf.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcCheckDigit = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (base.length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calcCheckDigit(cpf.slice(0, 9));
  const secondDigit = calcCheckDigit(cpf.slice(0, 10));

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function enrollmentIsRequired(bond) {
  return bond === 'student' || bond === 'teacher';
}

export function isValidEnrollment(bond, enrollment) {
  if (!enrollmentIsRequired(bond)) return true;
  if (!enrollment) return false;
  if (bond === 'student') return enrollment.length === 14;
  return true;
}

export function validateRegisterForm(values) {
  const errors = {};

  if (!isValidCPF(values.cpf)) {
    errors.cpf = 'Informe um CPF válido.';
  }
  if (!isValidEmail(values.email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  if (!values.name.trim()) {
    errors.name = 'Informe seu nome completo.';
  }
  if (values.cellphone.replace(/\D/g, '').length < 10) {
    errors.cellphone = 'Informe um telefone válido.';
  }
  if (!values.bond) {
    errors.bond = 'Selecione seu vínculo.';
  }
  if (enrollmentIsRequired(values.bond) && !values.enrollment) {
    errors.enrollment = 'Matrícula é obrigatória para esse vínculo.';
  } else if (!isValidEnrollment(values.bond, values.enrollment)) {
    errors.enrollment = 'A matrícula de estudante deve ter 14 caracteres.';
  }
  if (values.password.length < 8) {
    errors.password = 'A senha deve ter no mínimo 8 caracteres.';
  }
  if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = 'As senhas não conferem.';
  }

  return errors;
}