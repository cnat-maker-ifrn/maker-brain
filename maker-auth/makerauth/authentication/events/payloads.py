def build_user_payload(user):
    return {
        "id": user.id,
        "cpf": user.cpf,
        "email": user.email,
        "name": user.name,
        "cellphone": user.cellphone,
        "bond": user.bond,
        "enrollment": user.enrollment,
        "profile_picture": user.profile_picture.url if user.profile_picture else None,
        "groups": list(user.groups.values_list("name", flat=True)),
        "is_active": user.is_active,
    }
