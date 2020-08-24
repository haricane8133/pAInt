# It is interesting to note that this program is about 13 times slower than ./rgb2dark.py
# Here, we are implementing the things manually
# in the other program, we are taking an already oprimized function
import os
import numpy as np
import cv2
import math
from PIL import Image
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--input_path', type=str, default="./input.png", help="Path of the input RGB image to be darkened")
parser.add_argument('--output_path', type=str, default="./output.png", help="Path of the output darkened image")
args = parser.parse_args()
img_path = args.input_path # This is the input RGB image
op_img_path = args.output_path

# Helper methods
def rgb2gray(r, g, b):
    return math.floor(0.299 * r + 0.587 * g + 0.114 * b)
def hex2rgb(hex):
    hex = hex.lstrip('#')
    hlen = len(hex)
    return tuple(int(hex[i:i+hlen//3], 16) for i in range(0, hlen, hlen//3))
def hex2gray(hex):
    return rgb2gray(*hex2rgb(hex))
def rgb2hex(r, g, b):
    letters="A B C D E F".split()
    r1=math.floor(r/16)
    if r1>9:
        r1=letters[r1-10]
    r2=r%16
    if r2>9:
        r2=letters[r2-10]       
    g1=math.floor(g/16)
    if g1>9:
        g1=letters[g1-10]
    g2=g%16
    if g2>9:
        g2=letters[g2-10]     
    b1=math.floor(b/16)
    if b1>9:
        b1=letters[b1-10]
    b2=b%16
    if b2>9:
        b2=letters[b2-10]        
    r1=str(r1)
    r2=str(r2)
    g1=str(g1)
    g2=str(g2)
    b1=str(b1)
    b2=str(b2)         
    hex="#"+r1+r2+g1+g2+b1+b2
    return hex

# Choose colors for objects and update the file ./objects_dict.json
#     (It is a JSON/dict with a format visible to your naked eye)
# The following reads the JSON/dict into the variable
f = open("./objects_dict.json")
objects_dict_string = ""
for line in f:
    objects_dict_string += line.strip()
f.close()
objects_dict = json.loads(objects_dict_string)

# Creating the dict from which we use the rest of the program
#     (We do this to optimize the program further)
#     (We are not having the format of the objects JSON in the file like this to make sure the file is readable)
hex2idx = {}
for object_id in objects_dict:
    hex2idx[objects_dict[object_id]["color"]] = object_id

image = cv2.imread(img_path)

# We find the correct value to be entered and put it in the blue channel
for img_row in image:
    for pixel in img_row:
        color = rgb2hex(pixel[2], pixel[1], pixel[0])
        if(color == "#FFFFFF"):
            # If the user has left some places blank, treat it as sky
            pixel[0] = hex2idx("#A7E2E4")
        else:
            # Else, do the normal procedure
            #    If there is a wrong color other than while, it means that the user has been fiddling around with the developer options. We simply throw an error
            pixel[0] = hex2idx[color]

cv2.imwrite(op_img_path, image[:,:,0])