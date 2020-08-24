"""
python test.py  --model test --no_dropout --name style_monet_pretrained --A_path ./examples/syths/3.png
python test.py  --model test --no_dropout --name style_vangogh_pretrained --A_path ./examples/syths/3.png
python test.py  --model test --no_dropout --name style_ukiyoe_pretrained --A_path ./examples/syths/2_08.png
python test.py  --model test --no_dropout --name style_cezanne_pretrained --A_path ./examples/syths/2_08.png
"""
import os
from options.test_options import TestOptions
from data import create_dataset
from models import create_model
import util

def save_images(visuals, output_dir, file_name, aspect_ratio=1.0, width=256):
    for label, im_data in visuals.items():
        im = util.tensor2im(im_data)
        save_path = os.path.join(output_dir, file_name)
        util.save_image(im, save_path, aspect_ratio=aspect_ratio)

if __name__ == '__main__':
    opt = TestOptions().parse()  
    models_list = ['style_monet_pretrained','style_vangogh_pretrained','style_ukiyoe_pretrained','style_cezanne_pretrained']
    for style_id,premodel in enumerate(models_list):
        opt.name = premodel
        opt.num_threads = 0  
        opt.batch_size = 1    
        opt.serial_batches = True  
        opt.no_flip = True   
        opt.display_id = -1  
        
        file_name = str(style_id+1) + '.png'
        results_dir = opt.results_dir
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        
        dataset = create_dataset(opt)  
        model = create_model(opt)     
        model.setup(opt)               
        
        if opt.eval:
            model.eval()
        
        for i, data in enumerate(dataset):
            model.set_input(data)  
            model.test()           
            visuals = model.get_current_visuals()  
            img_path = model.get_image_paths()     
            save_images(visuals, results_dir, file_name, aspect_ratio=opt.aspect_ratio, width=opt.display_winsize)
        
    
