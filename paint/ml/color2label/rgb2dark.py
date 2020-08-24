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
#     (We are not having the format of the objects JSON in the file like this to make sure the file is readable)
label2bgr = {}
for object_id in objects_dict:
    color = hex2rgb(objects_dict[object_id]["color"])
    a = [color[2], color[1], color[0]]
    label2bgr[object_id] = a

image = cv2.imread(img_path)

for label in label2bgr:
    image[np.all(image == label2bgr[label], axis=-1)] = np.array([label]*3)

cv2.imwrite(op_img_path,image)