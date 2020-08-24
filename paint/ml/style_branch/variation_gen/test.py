"""
python test.py --name night2day_pretrained --no_flip --n_samples 5 --A_path ./examples/syths/1.png 
"""
import os
from options.test_options import TestOptions
from data import create_dataset
from models import create_model
import util

def save_images(images, names, output_dir, aspect_ratio=1.0, width=256):
    for idx,im_data in enumerate(images):
        im = util.tensor2im(im_data)
        save_path = os.path.join(output_dir, names[idx]+'.png')
        util.save_image(im, save_path, aspect_ratio=aspect_ratio)


opt = TestOptions().parse()

results_dir = opt.results_dir
if not os.path.exists(results_dir):
    os.makedirs(results_dir)

opt.num_threads = 1   
opt.batch_size = 1   
opt.serial_batches = True 

dataset = create_dataset(opt)

model = create_model(opt)
model.setup(opt)
model.eval()

if opt.sync:
    z_samples = model.get_z_random(opt.n_samples, opt.nz)

images = []
names = []

fname = opt.A_path.split('/')[-1].split('.')[0]
for i, data in enumerate(dataset):
    model.set_input(data)
    if not opt.sync:
        z_samples = model.get_z_random(opt.n_samples, opt.nz)
    for nn in range(opt.n_samples):
        encode = nn == 0 and not opt.no_encode
        _, fake_B, _ = model.test(z_samples[[nn]], encode=encode)
        images.append(fake_B)
        names.append(str(nn+1))
    save_images(images, names, results_dir, aspect_ratio=opt.aspect_ratio, width=opt.crop_size)

