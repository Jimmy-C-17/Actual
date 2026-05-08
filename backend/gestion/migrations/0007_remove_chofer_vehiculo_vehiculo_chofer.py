import django.db.models.deletion
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0006_incidente'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chofer',
            name='vehiculo',
        ),
        migrations.AddField(
            model_name='vehiculo',
            name='chofer',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vehiculo_asignado', to='gestion.chofer', verbose_name='Chofer Asignado'),
        ),
    ]
