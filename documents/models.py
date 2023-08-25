from django.db import models
from datetime import datetime

    
    
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
    
    
class Vaccine(models.Model):
    name = models.CharField(max_length=100)     # 백신 이름
    exp = models.TextField()                    # 한줄소개
    image = models.CharField(max_length=255,null=True)   # 제품사진1
    price = models.IntegerField() # 가격비교
    price_str = models.CharField(max_length=50) #가격 string
    link = models.URLField(max_length = 255)    #링크
    created_at = models.DateTimeField(auto_now_add=True, auto_now=False) #등록일
    category = models.ManyToManyField(Category)
    browers = models.CharField(max_length=100,null=True,blank=True)
    keyword = models.TextField(null=True)  # 키워드 데이터 추가

    # ram = models.FloatField(null=True)     #GB
    # hdd = models.FloatField(null=True)     #GB
    
    # 따로 리스트화 할건지 (window, mac(dawin), linux) # 0: window , 1: man, 2: linux
    #vos = models.CharField(max_length=100)
    # vos = models.ManyToManyField(Vos)
    
    # cpu도 보류
    # cpu = models.FloatField(null=True)
    
    
class Vos(models.Model):
    
    vc_id = models.ForeignKey("Vaccine", on_delete=models.CASCADE, null=True)
    # name = models.CharField(max_length=50, unique=True)
    os_type = models.PositiveSmallIntegerField(default=0)  # 0: window, 1: mac, 2: linux, 3: all로 취급
    ram = models.FloatField(null=True) #gb
    hdd = models.FloatField(null=True) #gb

    def __str__(self):
        return self.name
      
      
class Attack(models.Model):
    a_num = models.IntegerField(null=True)
    name = models.CharField(max_length=30)
    keyword = models.TextField(null=True)  #keyword
    
    # 공격 유형별 백신 우선순위 필드 추가
    vaccine_priorities = models.ManyToManyField(Vaccine, through='VaccinePriority')

    
    
    
    
class VaccinePriority(models.Model):
    attack = models.ForeignKey(Attack, on_delete=models.CASCADE)
    vaccine = models.ForeignKey(Vaccine, on_delete=models.CASCADE)
    priority = models.PositiveIntegerField()
    
    
    
    
# class vaccine_document(models.Model):
#     name = models.CharField(max_length=500)     # 백신 이름
#     one_line_exp = models.TextField()           # 한줄소개
#     image1 = models.CharField(max_length=255,null=True)   # 제품사진1 
#     exp1 = models.TextField()                # 설명
#     price1 = models.CharField(max_length=50)    #가격1
#     price2 = models.CharField(max_length=50)    #가격2
#     link = models.URLField(max_length = 200)    #링크
#     # 큰 제목
#     exp2 = models.TextField() #내용2
#     sub1_title = models.CharField(max_length=100,null=True) #중간제목
#     sub1_exp = models.TextField(null=True) #내용
#     sub2_title = models.CharField(max_length=100,null=True) #중간제목
#     sub2_exp = models.TextField(null=True) 
#     sub3_title = models.CharField(max_length=100,null=True) #중간제목
#     sub3_exp = models.TextField(null=True) 
#     sub4_title = models.CharField(max_length=100,null=True) #중간제목 (표제목)
#     image1 = models.CharField(max_length=255,null=True)   # 제품사진1
#     sub4_exp = models.TextField(null=True)
    
    
    
