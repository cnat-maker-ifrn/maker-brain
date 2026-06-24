from django.db import migrations

GROUPS = [
    {
        "name": "Owners",
        "permissions": ["add_user", "view_user", "change_user"],
    },
    {
        "name": "Managers",
        "permissions": ["add_user", "view_user", "change_user"],
    },
    {
        "name": "Scholarship Students",
        "permissions": [],
    },
    {
        "name": "Requesters",
        "permissions": [],
    },
]

def create_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    for data in GROUPS:
        group, _ = Group.objects.get_or_create(name=data["name"])

        for permission in data["permissions"]:
            perm = Permission.objects.filter(codename=permission).first()
            if perm:
                group.permissions.add(perm)

def delete_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    names = [g["name"] for g in GROUPS]
    Group.objects.filter(name__in=names).delete()

class Migration(migrations.Migration):
    dependencies = [("makerauth", "0001_initial")]
    operations = [migrations.RunPython(create_groups, delete_groups)]