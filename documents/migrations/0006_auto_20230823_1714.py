# Generated by Django 2.2.4 on 2023-08-23 17:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0005_auto_20230823_1703'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vos',
            name='vc_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='documents.Vaccine'),
        ),
    ]
