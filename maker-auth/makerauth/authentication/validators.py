from django.core.exceptions import ValidationError


def validate_cpf(value: str) -> None:
    """
    Validates a Brazilian CPF number.

    Rules:
    - Must contain exactly 11 digits (digits only, no formatting)
    - Must not be a sequence of repeated digits (e.g. '11111111111')
    - Must pass the two check-digit verification rounds
    """
    cpf = value.strip()

    if not cpf.isdigit():
        raise ValidationError('CPF must contain digits only, with no formatting.')

    if len(cpf) != 11:
        raise ValidationError('CPF must have exactly 11 digits.')

    if len(set(cpf)) == 1:
        raise ValidationError('CPF is invalid.')

    if not _has_valid_check_digits(cpf):
        raise ValidationError('CPF is invalid.')


def _calculate_check_digit(cpf_partial: str, weight_start: int) -> int:
    """
    Calculates a single CPF check digit.

    Multiplies each digit of `cpf_partial` by descending weights starting
    from `weight_start`, sums the products, and derives the check digit
    from the remainder: remainder < 2 → 0, otherwise → 11 - remainder.
    """
    total = sum(
        int(digit) * weight
        for digit, weight in zip(cpf_partial, range(weight_start, 1, -1))
    )
    remainder = total % 11
    return 0 if remainder < 2 else 11 - remainder


def _has_valid_check_digits(cpf: str) -> bool:
    """Returns True if both CPF check digits are correct."""
    first_check_digit = _calculate_check_digit(cpf[:9], weight_start=10)
    if first_check_digit != int(cpf[9]):
        return False

    second_check_digit = _calculate_check_digit(cpf[:10], weight_start=11)
    return second_check_digit == int(cpf[10])