from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0011_ruta_coordenadas'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ubicacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=150, verbose_name='Nombre del chofer o admin')),
                ('tipo', models.CharField(choices=[('chofer', 'Chofer'), ('admin', 'Admin')], default='chofer', max_length=20, verbose_name='Tipo de ubicación')),
                ('latitud', models.FloatField(verbose_name='Latitud')),
                ('longitud', models.FloatField(verbose_name='Longitud')),
                ('actualizado', models.DateTimeField(auto_now=True, verbose_name='Actualizado en')),
            ],
            options={
                'verbose_name': 'Ubicación',
                'verbose_name_plural': 'Ubicaciones',
                'unique_together': {('nombre', 'tipo')},
            },
        ),
    ]
