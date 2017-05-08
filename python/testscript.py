import sys

myinput = [line.strip() for line in open('python/input.txt')]
sys.stdout=open("python/output.txt","w")
for line in myinput:
    print(line+"NICE")
sys.stdout.close()
