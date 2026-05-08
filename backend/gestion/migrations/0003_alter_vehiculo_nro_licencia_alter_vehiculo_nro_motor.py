from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0002_vehiculo_remove_chofer_placa_chofer_estado_activo_and_more'),
    ]
    operations = [
        migrations.AlterField(
            model_name='vehiculo',
            name='nro_licencia',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Licencia de Transporte'),
        ),
        migrations.AlterField(
            model_name='vehiculo',
            name='nro_motor',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Número de Motor'),
        ),
    ]
