import copy
import numpy as np
import matplotlib.pyplot as plt

import os
import torch 

import copy
from PIL import Image

from utils import *

import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--content', type=str, default='images/content/1.png', help="Content image path relative to parent directory. Should not start with ./")
parser.add_argument('--style', type=str, default='images/style/s1.png', help="Style image path relative to parent directory. Should not start with ./")
parser.add_argument('--results_dir', type=str, default='results', help="Output directory")
args = parser.parse_args()

# Hyperparameters
MAX_IMAGE_SIZE = 512

# Optimizer
OPTIMIZER = 'adam' #'lbfgs' or 'adam'
ADAM_LR = 10
CONTENT_WEIGHT = 5e0
STYLE_WEIGHT = 1e1
TV_WEIGHT = 1e-3
NUM_ITER = 100
SHOW_ITER = 100

output_dir = args.results_dir
if not os.path.exists(output_dir):
    os.mkdir(output_dir)

# Image Files
INIT_IMAGE = 'content' # 'content' or 'random'
PRESERVE_COLOR = 'False' # 'False'
PIXEL_CLIP = 'True' # or 'False' - Clipping produces better images
CONTENT_PATH = args.content
STYLE_PATH = args.style

content_img_name = CONTENT_PATH.split('/')[-1].split('.')[0]
style_img_name = STYLE_PATH.split('/')[-1]
output_path  = os.path.join(output_dir, style_img_name)

VGG19_PATH = 'models/vgg19-d01eb7cb.pth'
POOL = 'max'

device = ("cuda" if torch.cuda.is_available() else "cpu")

# Load Images
content_img = load_image(CONTENT_PATH)
style_img = load_image(STYLE_PATH) 

content_tensor = itot(content_img,MAX_IMAGE_SIZE).to(device)
style_tensor = itot(style_img,MAX_IMAGE_SIZE).to(device)
g = initial(content_tensor, init_image=INIT_IMAGE)
g = g.to(device).requires_grad_(True)

vgg = models.vgg19(pretrained=False)

# Load pretrained weights
vgg.load_state_dict(torch.load(VGG19_PATH), strict=False)

model = copy.deepcopy(vgg.features)
model.to(device)

# Turn-off unnecessary gradient tracking
for param in model.parameters():
    param.requires_grad = False

if (OPTIMIZER=='lbfgs'):
    optimizer = optim.LBFGS([g])
elif (OPTIMIZER=='adam'):
    optimizer = optim.Adam([g], lr=ADAM_LR)

import time 
start = time.time()
out = stylize(g,model,content_tensor,style_tensor,optimizer,CONTENT_WEIGHT,STYLE_WEIGHT,TV_WEIGHT,NUM_ITER=NUM_ITER,SHOW_ITER=SHOW_ITER,PRESERVE_COLOR=PRESERVE_COLOR,PIXEL_CLIP=PIXEL_CLIP)
end = time.time()
saveimg(ttoi(out.clone().detach()), output_path)
print(f"Time taken: {end-start} secs")
