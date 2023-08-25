# Generated by Django 2.2.4 on 2023-08-24 14:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0009_auto_20230824_0108'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vos',
            name='vc_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='documents.Vaccine'),
        ),
        migrations.CreateModel(
            name='VaccinePriority',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('priority', models.PositiveIntegerField()),
                ('attack', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='documents.Attack')),
                ('vaccine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='documents.Vaccine')),
            ],
        ),
        migrations.AddField(
            model_name='attack',
            name='vaccine_priorities',
            field=models.ManyToManyField(through='documents.VaccinePriority', to='documents.Vaccine'),
        ),
    ]