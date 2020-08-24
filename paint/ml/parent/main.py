"""
python main.py --art --input_path inputs_dark/3.png --num_variations 30
"""

import os
import time
import numpy as np
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--input_path', type=str, default='inputs_dark/2.png', help="Input path relative to parent directory. Should not start with ./")
parser.add_argument('--num_variations', type=int, default=10, help="Number of variations to output for a given synthesised image")
parser.add_argument('--art', action='store_true', help="Whether to do artistic touch")
parser.add_argument('--custom_art', action='store_true', help="Whether user uploads custom filter. If both --art and --custom_art are given, --art will be overwritten by --custom_art")
args = parser.parse_args()

input_path = args.input_path
num_variations = args.num_variations
synth_image_name = 'synthesized.png'

input_filename = input_path.split('/')[-1]
input_filename_wo_ext = input_path.split('/')[-1].split('.')[0]

start = time.time()

os.chdir('../image_synthesis')
print(f"---> Performing Image Synthesis >> model input: {input_filename} | output: synthesized.png")
os.system(f"python test.py --name ./ade20k_pretrained/ --dataset_mode ade20k \
         --dataroot ../parent/{input_path} --results_dir ../parent/outputs/{input_filename_wo_ext}/")
synth = time.time()


os.chdir('../style_branch/variation_gen')
print(f"---> Generating variations >> model input: synthesized.png | output: ./variations")
synth_image_path = f"../../parent/outputs/{input_filename_wo_ext}/{synth_image_name}"
out_path = f"../../parent/outputs/{input_filename_wo_ext}/variations"
os.system(f"python test.py --name night2day_pretrained --no_flip --n_samples {num_variations} --A_path {synth_image_path} \
        --results_dir {out_path}")
os.chdir('../../parent')

if args.art or args.custom_art:
	image_id = np.random.randint(low=1,high=num_variations+1)
	variation_filename = str(image_id) + '.png'
	art_input_path = f"../../parent/outputs/{input_filename_wo_ext}/variations/{variation_filename}"
	out_path = f"../../parent/outputs/{input_filename_wo_ext}/artistic"
	
	if args.custom_art:
		#############
		# custom_style_path should be the same 
		# for a given user i.e everytime a user uploads an image,
		# it should be stored under outputs/input_name/style.png 
		# => you can hardcode the path. The path used here is not 
		# hardcoded and purely for testing purposes.
		###############
		custom_style_path = input("Enter path to the style image (should be inside parent directory and not start with ./):  ") 
		style_path = f"../../parent/{custom_style_path}"
		os.chdir('../style_branch/custom_style')
		print(f"--> Transfering style from {custom_style_path} to {variation_filename} | output: ./artistic")
		os.system(f"python test.py --content {art_input_path} --style {style_path} --results_dir {out_path}")
	else:
		os.chdir('../style_branch/style_gen')
		print(f"---> Producing artistic touch >> model input: variation number {image_id} | output: ./artistic")
		os.system(f"python test.py  --model test --no_dropout --A_path {art_input_path} --results_dir {out_path}")
		os.chdir('../../parent')

print(f"Total time taken: {np.around(time.time()-start,2)} secs")