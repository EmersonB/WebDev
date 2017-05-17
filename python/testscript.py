import sys

name = sys.argv[1]
uuid = sys.argv[2]
myinput = [line.strip() for line in open('python/'+name)]
sys.stdout=open("python/"+uuid,"w")
for line in myinput:
    print(line+"NICE")
sys.stdout.close()
