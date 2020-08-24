"""
python test.py --name ./ade20k_pretrained/ --dataset_mode ade20k --dataroot ../parent/input.png --results_dir ../parent
"""


import warnings
warnings.filterwarnings("ignore")

import os

import torch
import torch.nn as nn
import torch.utils.data

from PIL import Image
import numpy as np
import data
from options.test_options import TestOptions
from models.pix2pix_model import Pix2PixModel
import util

def save_images(output, output_dir, file_name):
    image_numpy = util.convert_output_to_numpy(output)        
    save_path = os.path.join(output_dir, file_name)
    synth_image = util.save_image(image_numpy, save_path, create_dir=True)
    
opt = TestOptions().parse()
output_dir = opt.results_dir

dataloader = data.create_dataloader(opt)

model = Pix2PixModel(opt)
model.eval()

for i, data_i in enumerate(dataloader):
    generated = model(data_i, mode='inference')
    img_path = data_i['path']
    for b in range(generated.shape[0]):
        img_path[b] = img_path[b].replace('/', '\\')
        file_name = 'synthesized.png'
        output = generated[b]
        save_images(output, output_dir,file_name)


