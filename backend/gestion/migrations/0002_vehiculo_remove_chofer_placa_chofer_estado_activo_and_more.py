import django.db.models.deletion
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0001_initial'),
    ]
    operations = [
        migrations.CreateModel(
            name='Vehiculo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('placa', models.CharField(max_length=15, unique=True, verbose_name='Placa')),
                ('modelo', models.CharField(max_length=50, verbose_name='Modelo/Marca')),
                ('nro_motor', models.CharField(blank=True, max_length=50, verbose_name='Número de Motor')),
                ('nro_licencia', models.CharField(max_length=50, verbose_name='Licencia de Transporte')),
            ],
            options={
                'verbose_name': 'Vehículo',
                'verbose_name_plural': 'Vehículos',
            },
        ),
        migrations.RemoveField(
            model_name='chofer',
            name='placa',
        ),
        migrations.AddField(
            model_name='chofer',
            name='estado_activo',
            field=models.BooleanField(default=True, verbose_name='¿Socio Activo?'),
        ),
        migrations.AddField(
            model_name='chofer',
            name='nro_socio',
            field=models.IntegerField(null=True, unique=True, verbose_name='Número de Socio'),
        ),
        migrations.AddField(
            model_name='chofer',
            name='vehiculo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='gestion.vehiculo', verbose_name='Vehículo Asignado'),
        ),
    ]